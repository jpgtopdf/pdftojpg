var httpObject = null;
var strDate = '';
var strFolderName = '';
var bWaiting = 0;
var nFileID = 0;
var strDownloadURL = "";
var nUploadPercent = 0;
var nDPIType = 150;
var nFolderID = 0;
var nFirst = 0;
var nLast = 0;
var strPrefix = "";
//var PicURLAdded = false;
var nPage_num = 0;
var myTimer;
var nTimerNow = 0;
var strOption1 = "";
var strOption2 = "";
var strPicWidth = "";
var strPicDPI = "";
var nImgOption = 1;
var strExampleURLs = "";
var strFillColor = "FFFFFF";

function $get(id)
{
    return document.getElementById(id);
}
/*
function OnDPI( nDPI )
{
	if( nDPI == 0 )
	{
		$get('dpi_txt').disabled = false;
		nDPIType = 0;
	}
	else
	{
		$get('dpi_txt').disabled = true;
		nDPIType = nDPI;
	}
}
*/

function RedText( strInput )
{
	return "<font color='#FF0000'>" + strInput + "</font>";
}

function InitAJAX()
{
		if (window.ActiveXObject) 
			httpObject =  new ActiveXObject("Microsoft.XMLHTTP");
  		else if (window.XMLHttpRequest) 
  			httpObject =  new XMLHttpRequest();
  		else
  		{
    			alert("Your Web browser does not support AJAX.");
    			return;
  		}
}

function GetFolderName()
{
//	if( strFolderName.length == 0 )
	strFolderName = Make_random_string( 16 );
	return strFolderName;
}

function Make_random_string( nLength )
{
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz";
	var string_length = nLength;
	var randomstring = '';
	for (var i=0; i<string_length; i++) 
	{
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	 
	return randomstring;
}


var uploader = new plupload.Uploader({
	browse_button: 'browse',
	url: 'upload.php',
  	multi_selection: false,
//	multipart: true,
//	chunk_size : '1mb',  	
	filters : {
		max_file_size : '50mb',
		mime_types: [
			{title : "PDF files", extensions : "pdf"}
		]
	}  
});

uploader.init();

uploader.bind('FilesAdded', function(up, files)
{
	var maxfiles = 1;
	if(up.files.length > maxfiles )
	{
		$get("filelist").innerHTML = RedText( "You can only upload one PDF file at a time." );
		uploader.splice();
		return;
	}
	
	strFolderName = GetFolderName();
	var strPrefix = "";//$get( "prefix_txt" ).value;
	
	
	up.settings.multipart_params = {  "folder_name": strFolderName, "prefix_name": strPrefix };
	
	var html = '';
	var num = 0;
	plupload.each(files, function(file) 
	{
		var strFileName = file.name;
		if( strFileName.length > 30 )
		{
			var strImgExt = strFileName.split('.').pop();
			strFileName = strFileName.substring( 0, 30 ) + "~1." + strImgExt;
		}
		html += '<div class="div_file" id="' + file.id + '">Uploading ' + strFileName + '<b></b></div>';    
		html += '<div id="div_percent"></div>';
		html += '<div class="div_del" id="div_del" onclick="deletefile(\'' + file.id  +   '\');">Cancel</div>';
		nFileID = file.id;		
		
		$get( "output_file_info" ).innerHTML = 'Press the "Convert Now" button to convert your pdf document to JPEG images.';
    
    	nUploadPercent = 0;
    	
    	///$get( "prefix_txt" ).disabled = true;
    	
    	var myElem = $get( "example_pages" );
    	if( myElem != null )
			myElem.innerHTML = "";
  ///  	$get( "example_pages" ).innerHTML = "";
    	
		up.start();
		
		num++;
 	 });
  
	document.getElementById('filelist').innerHTML = html;
});
 
uploader.bind('UploadProgress', function(up, file)
{
	if( file.percent >= nUploadPercent )
	{
		nUploadPercent = file.percent;
  		$get( "div_percent" ).innerHTML =  nUploadPercent + "%";
  	}
});
 
uploader.bind('Error', function(up, err) 
{
		var strErrorMsg = err.message;
		if( strErrorMsg == "File extension error." )
			strErrorMsg = "You can only upload an file in PDF format.";
		else if( strErrorMsg == "File size error." )
			strErrorMsg = "The maximum file size allowed is 50 MB.";		
	
		$get("filelist").innerHTML =  RedText( strErrorMsg );
//		uploader.splice();
});

uploader.bind('FileUploaded', function() 
{
	if (uploader.files.length == (uploader.total.uploaded + uploader.total.failed)) 
	{
//		PicURLAdded = false;
		GetPDFProperties();
		uploader.splice();
	}
            
});

function deletefile( id ) 
{
	$get( "filelist" ).innerHTML = " ";
	
	uploader.removeFile(  uploader.getFile(id) );
	///$get( "prefix_txt" ).disabled = false;
	$get( "example_pages" ).innerHTML = "";
}

function CancelUpload()
{
	uploader.removeFile(  uploader.getFile( nFileID ) );
	///$get( "prefix_txt" ).disabled = false;
	$get( "example_pages" ).innerHTML = "";
}

function replaceAll( find, replace, str ) 
{
  return str.replace(new RegExp(find, 'g'), replace);
}

function GetPDFProperties()
{
		if( bWaiting == 1 )
		{
			alert( "Please wait a few seconds..." );
			return;
		}
		
		if ( httpObject == null ) 
			InitAJAX(); 	

  		var randomstring = Make_random_string( 5 );
		bWaiting = 1;
		
		$get( "filelist" ).innerHTML = "Please wait a few seconds...";
			
    	httpObject.open("GET", "GetPDFInfo.php?folder=" + strFolderName + "&randomstr=" + randomstring,  true);    		 			
  		
  		if ( httpObject != null ) 
  		{
  				httpObject.onreadystatechange = function()
				{
  					if( httpObject.readyState == 4  )
  					{	
						var str=httpObject.responseText;
						var strOut = "";
  				     
  				    	var nRes = str.split(",");
  				     	var nNum = nRes[ 0 ];
  				    	 					    	 						
						if( nNum > 0 )
						{		
							nPage_num = nNum;
						//	var nW = nRes[ 1 ];
						//	var nH = nRes[ 2 ];
						
							$get('page_range_1').value = 1;
							if( nPage_num >= 1 )
								$get('page_range_2').value = nPage_num;
								
							if( nPage_num > 20 )
							{								
								var strPart1 = '<div class="LabelsDownloadURL"><a href="https://pdftojpg.me/ViewPage.php?folder=';
								strExampleURLs = 		
									'<div class="LineH40PX3">' +
										'<strong>If you don\'t know which DPI fit your screen best, you can click on the following links to view images in different DPI. You can change the DPI value between 6 and 2400 in the address bar, for example, you can change dpi=75 to dpi=200 and press Enter. </strong>'+	
									'</div>	'+											
									'<div class="LineH40PX3"><div class="LabelsDownloadURL">Page 5:</div>' + 
										strPart1 + strFolderName + '&page=5&dpi=75" target="_blank">75 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=150" target="_blank">150 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=180" target="_blank">180 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=200" target="_blank">200 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=250" target="_blank">250 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=300" target="_blank">300 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=450" target="_blank">450 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=5&dpi=600" target="_blank">600 DPI</a></div>' + 
									'</div>	' + 
									'<div class="LineH40PX3"><div class="LabelsDownloadURL">Page 10:</div>' + 
										strPart1 + strFolderName + '&page=10&dpi=75" target="_blank">75 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=150" target="_blank">150 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=180" target="_blank">180 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=200" target="_blank">200 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=250" target="_blank">250 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=300" target="_blank">300 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=450" target="_blank">450 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=10&dpi=600" target="_blank">600 DPI</a></div>' + 
									'</div>	' + 
									'<div class="LineH40PX3"><div class="LabelsDownloadURL">Page 15:</div>' + 
										strPart1 + strFolderName + '&page=15&dpi=75" target="_blank">75 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=150" target="_blank">150 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=180" target="_blank">180 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=200" target="_blank">200 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=250" target="_blank">250 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=300" target="_blank">300 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=450" target="_blank">450 DPI</a></div>' + 
										strPart1 + strFolderName + '&page=15&dpi=600" target="_blank">600 DPI</a></div>' + 
									'</div>	';								
								
								if( nImgOption == 2 )
									$get( "example_pages" ).innerHTML = strExampleURLs;
							}
							
							strOut = 	"Successfully uploaded, there are " + nPage_num.toString() + " pages in your pdf document.";
							
							bWaiting = 0;	
						}							
						else
						{
							strOut = "Failed to upload. Invalid file type or file size.";		
							bWaiting = 0;				
						}
						
						$get( "filelist" ).innerHTML = strOut;
    					}
    				}
    				
    				httpObject.send();
		}
}

function DisableConvert()
{
	$get( "ConvertDIV" ).innerHTML = '<div class="button big" id="doConvert"> Convert Now </div><div class="button big" id="ConvertNew" onclick="newtab();"> Convert Another PDF </div><div class="button big" id="btnCompress" onclick="newwin(\'http://compressimage.toolur.com/\');"> Compress JPEG </div><div class="button big" id="btnResize" onclick="newwin(\'http://resizeimage.net/\');"> Resize Image </div>';
}

function EnableConvert()
{
	myTimer = setInterval( function(){ Timer() }, 100 );
	nTimerNow = 0;	
}

function Timer()
{
	nTimerNow++;
	if( nTimerNow == 10 )
	{
		$get( "ConvertDIV" ).innerHTML = '<div class="button big" id="doConvert" onclick="DoConvert();"> Convert Now </div><div class="button big" id="ConvertNew" onclick="newtab();"> Convert Another PDF </div><div class="button big" id="btnCompress" onclick="newwin(\'http://compressimage.toolur.com/\');"> Compress JPEG </div><div class="button big" id="btnResize" onclick="newwin(\'http://resizeimage.net/\');"> Resize Image </div>';
		clearInterval( myTimer );
	}
}

function DoConvert()
{
		if( bWaiting == 1 )
		{
			alert( "Please wait a few seconds..." );
			return;
		}
		
		if ( httpObject == null ) 
			InitAJAX(); 	

  		var randomstring = Make_random_string( 5 );
		bWaiting = 1;
		
		var nDPI = "0";
		
/*		if( nDPIType > 0 )
			nDPI = nDPIType;
		else*/
			
		var nWidth = "0";
			
		if( nImgOption == 1 )
		{
			nWidth = $get('width_txt').value;
			if( nWidth.length == 0 || nWidth < 60 || nWidth > 30000 )
			{
				$get( "output_file_info" ).innerHTML = "Please specify a valid value for the width or DPI of output images.";
				bWaiting = 0;
				return;
			}
			nDPI ="0";
		}
		else
		{
			nDPI = $get('dpi_txt').value;
			if( nDPI.length == 0 || nDPI < 6 || nDPI > 2400 )
			{
				$get( "output_file_info" ).innerHTML = "Please specify a valid value for the width or DPI of output images.";
				bWaiting = 0;
				return;
			}			
			nWidth ="0";
		}
						
		
		nFirst = parseInt( $get('page_range_1').value );
		nLast = parseInt( $get('page_range_2').value );
		
		$get( "output_file_info" ).innerHTML = "Please wait a few seconds...";
//		PicURLAdded = false;
			
		DisableConvert();	
			
    	httpObject.open("GET", "DoConvert.php?folder=" + strFolderName + "&width=" + nWidth + "&dpi=" + nDPI +  "&first=" + nFirst.toString() + "&last=" + nLast.toString() + "&strFillColor=" + strFillColor + "&randomstr=" + randomstring,  true );   
    	
  		if ( httpObject != null ) 
  		{
  				httpObject.onreadystatechange = function()
				{
  					if( httpObject.readyState == 4  )
  					{	
						var str=httpObject.responseText;
						var strOut = "";
  				     
  				    	var nRes = str.split(",");
  				     	var nNum = nRes[ 0 ];
  				     	
  				     	var bShowURLsInstantly = false;
  				    	 					    	 						
						if( nNum == 900 )
						{		
							var nSecs = nRes[ 1 ] / 10;
							var nSecs2 = nRes[ 4 ]   / 10;
							nFolderID =  nRes[ 2 ];
							strPrefix = nRes[ 3 ];
							
							if( nLast - nFirst >= 5 )
							{
								var strDownloadURL = "https://pdftojpg.me/files/download/" + strFolderName + "/output/" + nFolderID.toString() + ".zip";
					//			var strSeparateURL = '<div id="PicURL" onclick="ShowPicURL();">Show the URLs of separate images.</div><br>';
								strOut = "Successfully converted. ";
								strOut += 'It\'s recommended to download the zip file with a download management software.' + '<br><a href="' + strDownloadURL +  '" target="_blank">Download the zip file</a>.' ;
					//			strOut += '<br>Alternatively, you can also download each image as a separate file.<br> ' + strSeparateURL;
								strOut += '<br>Alternatively, you can also download each image as a separate file:<br>';
								bShowURLsInstantly = true;
								bWaiting = 0;	
							}
							else
							{
								strOut = "Successfully converted. Download them now: <br>";
								bShowURLsInstantly = true;
								bWaiting = 0;
							}
						}		
						else if( nNum == 899 )
						{
							var nPageConverted = nRes[ 1 ];
							strOut =  "Each page can be converted ONCE only, some pages have been converted before, such as page " + nPageConverted.toString() + ".";
							bWaiting = 0;
						}			
						else if( nNum == 101 )	
						{
							strOut =  "You can only convert up to 100 pages at a time if the DPI is larger than 300.";
							bWaiting = 0;
						}
						else if( nNum == 106 )	
						{
							strOut =  "You can only convert up to 5 pages at a time if the DPI is larger than 900.";
							bWaiting = 0;
						}	
						else if( nNum == 107 )	
						{
							strOut =  "You can only convert up to 5 pages at a time if the width is larger than 9000px.";
							bWaiting = 0;
						}											
						else if( nNum == 1 )	
						{
							strOut =  "Invalid DPI, please set the DPI to a number between 6 and 2400.";
							bWaiting = 0;
						}		
						else if( 	nNum>=3 && nNum <=5 )
						{
							strOut =  "Invalid page range.";
							bWaiting = 0;
						}																		
						else
						{
							strOut = "Failed to convert." + nNum.toString();		
							bWaiting = 0;				
						}
						
						$get( "output_file_info" ).innerHTML = strOut;
						if( bShowURLsInstantly )
							ShowPicURL();
						EnableConvert();
    				}
    			}
    				
    			httpObject.send();
		}	
}

function pdf2jpg_pad( n, width, z ) 
{
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function ShowPicURL()
{
//	if( PicURLAdded )return;
	
	var strOut = $get( "output_file_info" ).innerHTML;
	
	var nL = nPage_num.toString().length;
	
	var kLoopX = 1;
	var nItemsPerLine = 8;

	var iLoopX = 0;
	for(  iLoopX=nFirst; iLoopX<=nLast; iLoopX++ )
	{	
		var strIndex = pdf2jpg_pad( iLoopX, nL );
		var strDownURL = "https://pdftojpg.me/files/download/" + strFolderName + "/output/" + nFolderID.toString() + "/" + strPrefix + "-" + strIndex + ".jpg";
		var strPage = "Page " + iLoopX.toString();
		
		if( kLoopX % nItemsPerLine == 1 )
		{
			strOut += '<div class="LineH40PX3">';
		}
		
		strOut += '<div class="LabelsDownloadURL"><a href="' + strDownURL +  '" target="_blank">' + strPage + '</a></div>';
		
		if( kLoopX % nItemsPerLine == 0 )
		{
			strOut += '</div>';
		}		
		
		kLoopX++;
	}	
	
	if( ( kLoopX - 1 ) % nItemsPerLine != 0 )
		strOut += '</div>';
	
	$get( "output_file_info" ).innerHTML = strOut;
	
//	PicURLAdded = true;
}

function newtab()
{
	var win = window.open( "https://pdftojpg.me/", '_blank' );
	win.focus(); 
}

function newwin( strURL )
{
	var win = window.open( strURL, '_blank' );
	win.focus(); 
}

function Init()
{
	strOption1 = $get( "Option1" ).innerHTML;
	strOption2 = $get( "Option2" ).innerHTML;
		
	strPicWidth = $get( "width_txt" ).value;
	strPicDPI = $get( "dpi_txt" ).value;	
}

function OnSelectionType( nIndex )
{
	if( nIndex == 1 )
	{		
		strPicDPI = $get( "dpi_txt" ).value;	
		$get( "Option1" ).innerHTML = strOption1;
		$get( "Option2" ).innerHTML = "";
		$get( "width_txt" ).value = strPicWidth;
		nImgOption = 1;
	}
	else
	{
		strPicWidth = $get( "width_txt" ).value;
		$get( "Option1" ).innerHTML = "";
		$get( "Option2" ).innerHTML = strOption2;
		nImgOption = 2;
		$get( "dpi_txt" ).value = strPicDPI;	
		
		var myElem = $get( "example_pages" );
		if( myElem != null )
			myElem.innerHTML = strExampleURLs;
	}		
}

Init();
OnSelectionType( 1 );