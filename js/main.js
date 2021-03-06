jQuery(function(){
	
	/*
	if(!jQuery.isFunction(jQuery.fn.on)){
		var jquery_version_error_message = 'The contact form requires jQuery 1.7.2 to work properly.<br />jQuery '+jQuery().jquery+' is loaded.';
		jQuery('.cfg-contactform').prepend('<p style="color:#FF0000">'+jquery_version_error_message+'</p>');
	}
	*/
	
	jQuery('#cfg-contactform-1 .cfg-uploadfilename').val(''); // FF may keep the file name in the cfg-uploadfilename input after submitting and refreshing the page
	
	jQuery('#cfg-contactform-1 .cfg-captcha-refresh').click(function(){
		
		jQuery('#cfg-contactform-1 .cfg-captcha-img').attr('src','cfg-contactform-1/inc/captcha.php?r='+Math.random());
	});
	
	jQuery('#cfg-contactform-1 .cfg-submit').click(function(){
		
		var formcontainer = jQuery(this).closest('.cfg-contactform');
		var loading = formcontainer.find('.cfg-loading');
		
		loading.show();
		
		var submit_btn =  jQuery(this);
		submit_btn.hide();
		
		formcontainer.find('.cfg-errormessage').hide().remove();
		
		var form_value_array = Array();
		var radio_value = Array();
		var checkbox_value = Array();
		var selectmultiple_value = Array();
		var deleteuploadedfile_value = Array();
		
		formcontainer.find('.cfg-form-value').each(function()
		{
			var elementlabel = jQuery(this).closest('.cfg-element-container').find('.cfg-label-value');
			var elementlabel_id = elementlabel.closest('label').attr('id');
			var elementlabel_value = elementlabel.html();
			
			
			
			// catch uploads
			if(jQuery(this).hasClass('cfg-uploadfilename'))
			{
				var key = jQuery(this).prop('name');
				var value =  jQuery.trim(jQuery(this).val());
				
				var deletefile = jQuery(this).closest('.cfg-element-content').find('.cfg-uploaddeletefile').val();
							
				form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value, 'element_type':'upload', 'filename':value, 'element_type':'upload', 'deletefile':deletefile});
			}
			
			
			// catch input text values, textarea values, select values
			if(jQuery(this).is('.cfg-type-text, .cfg-type-textarea, .cfg-type-select'))
			{
				var key = jQuery(this).prop('id');
				var value = jQuery(this).val();
				form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
			}
			
			
			// catch radiobutton values
			if(jQuery(this).is(':radio'))
			{
				var key = jQuery(this).prop('name');
				var value = jQuery(this).val();
				
				var check_index_radio_form_value = form_value_array.length+1;
				
				if(jQuery(this).is(':checked')){
					form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
					radio_value[key] = value;
				}
				
				if( jQuery(this).is( jQuery(this).closest('.cfg-element-container').find('input[name='+key+']:last')) )
				{
					if(!radio_value[key]){
						form_value_array.push({'element_id': key, 'element_value': '', 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
					}
				}
			}
	
			
			// catch checkbox values
			if(jQuery(this).is(':checkbox'))
			{
				var key = jQuery(this).prop('name');
				var value = jQuery(this).val();
					
				if(jQuery(this).is(':checked'))
				{
					
					form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
					
					checkbox_value[key] = value;
					
				}
				
				if( jQuery(this).is(jQuery(this).closest('.cfg-element-container').find('input[name='+key+']:last')))
				{
					// we are at the last checkbox, and the checkbox[name] array value is still empty => insert fieldname: '' in the notification
					if(!checkbox_value[key])
					{
						form_value_array.push({'element_id': key, 'element_value': '', 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
					}
				}
			}
			
			// catch multiple select values
			if(jQuery(this).hasClass('cfg-type-selectmultiple'))
			{
				var key = jQuery(this).prop('name'); // must be placed here, not in each() or php will return Undefined index: element_id
				
				jQuery(this).find('option').each(function()
				{
					var value = jQuery(this).val();
						
					if(jQuery(this).is(':selected'))
					{
						form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
						selectmultiple_value[key] = value;
					}
					
					if( jQuery(this).is( jQuery(this).closest('.cfg-type-selectmultiple').find('option:last')) )
					{
						// we are at the last option, and the selectmultiple[name] array value is still empty => insert fieldname: '' in the notification
						if(!selectmultiple_value[key])
						{
							form_value_array.push({'element_id': key, 'element_value': '', 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
						}
					}
					
				});
				
			}
			
			// catch time values
			if(jQuery(this).hasClass('cfg-type-time'))
			{
				//var key = jQuery(this).find('.cfg-time-hour').prop('name');
				var key = jQuery(this).closest('.cfg-element-container').find('.cfg-time-hour').prop('name');
				var ampm = jQuery(this).closest('.cfg-element-container').find('.cfg-time-ampm').val();
				if(ampm == undefined) ampm = ''; // no quote on undefined
				var value = jQuery(this).closest('.cfg-element-container').find('.cfg-time-hour').val()+':'+jQuery(this).closest('.cfg-element-container').find('.cfg-time-minute').val()+' '+ampm;
				
				form_value_array.push({'element_id': key, 'element_value': value, 'elementlabel_id':elementlabel_id, 'elementlabel_value':elementlabel_value});
			}
			
		});
		
		
		// catch list of uploaded files to delete
		formcontainer.find('.cfg-deleteuploadedfile').each(function(){
			deleteuploadedfile_value.push(jQuery(this).val());
		});
		
		
		var captcha_img;
		var captcha_input;
		
		if(formcontainer.find('.cfg-captcha-img').length)
		{
			captcha_img = 1;
			captcha_input = formcontainer.find('.cfg-captcha-input').val();
		}
		
		
		// console.log(deleteuploadedfile_value);
		// console.log(form_value_array);
		

		jQuery.post('cfg-contactform-1/inc/form-validation.php',
				{ 
				'captcha_img':captcha_img,
				'captcha_input':captcha_input,
				'form_value_array':form_value_array,
				'deleteuploadedfile':deleteuploadedfile_value
				},
				function(data)
				{
					
					data = jQuery.trim(data);
					
					// 	console.log(data);
					
					response = jQuery.parseJSON(data);
						
					if(response['status'] == 'ok')
					{
						
						if(response['redirect_url'])
						{
							// we do not hide the loading animation because the redirection can take some time (prevents wondering what is happening)
							window.location.href = response['redirect_url'];
						} else
						{
							loading.hide();
							
							validation_message = '<div class="cfg-validationmessage">'+response['message']+'</div>';
								
							formcontainer.find('.cfg-element-container').each(function()
							{
								if(!jQuery(this).find('.cfg-title').html())
								{
									jQuery(this).slideUp('fast');
								}
							});
							
							jQuery('html, body').animate({scrollTop:formcontainer.offset().top}, 'fast');
							
							formcontainer.find('.cfg-contactform-content').append(validation_message);
						}
							
					} else
					{
						loading.hide();
						
						submit_btn.show();
						
						for(var i=0; i<response['message'].length; i++)
						{
							// name* : catch all the elements containing the element_id string (can be paragraphs above inputs)
							// first removed: error messages is positionned above the first name* found
							// IE does not like (name[]:first), we use .first() instead ( .filter(':first') is ok too)
							var optioncontainer = jQuery('[name*='+response['message'][i]['element_id']+']').first().closest('.cfg-element-content');

							jQuery('<div class="cfg-errormessage">'+response['message'][i]['errormessage']+'</div>').prependTo(optioncontainer).fadeIn();
						}						
						
						// scrolls to the first error message
						jQuery('html, body').animate({scrollTop: jQuery('#'+response['message'][0]['elementlabel_id']).offset().top},'fast'); 	
						
					}
				} /* end function data */
			); /* end jQuery.post */
	}); /* end click submit */
	
	
	// DELETE UPLOADED FILE
	jQuery('body').on('click', '#cfg-contactform-1 .cfg-deleteupload', function()
	{
		var filename = jQuery(this).closest('.cfg-uploadsuccess-container').find('.cfg-deleteupload-filename').val();
		
		// to add the filename to the list of files to delete
		// // the .cfg-deleteuploadedfile input can also be added in case of chain upload (handlers.js)
		jQuery(this).closest('.cfg-element-content').append('<input value="'+filename+'" type="hidden" class="cfg-deleteuploadedfile" />');
		
		// reset the upload input that contains the filename value
		jQuery(this).closest('.cfg-element-content').find('.cfg-uploadfilename').val('');
		
		// must come last, jQuery(this) is used to access closest elements
		jQuery(this).closest('.cfg-uploadsuccess-container').remove();

	});
	
	
});



function ajaxfunction(requestPage, responseAssign)
{
	var ajaxRequest;  // The variable that makes Ajax possible!
	try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();
	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e){
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}
	// Create a function that will receive data sent from the server
	ajaxRequest.onreadystatechange = function(){
		if(ajaxRequest.readyState == 4){
			eval(responseAssign);
		}
	}
	ajaxRequest.open("GET", requestPage, true);
	ajaxRequest.send(null); 
}

function ajaxPost()
{
	ajaxFunctionpost("selPreview.php","seller", "$('#pagep').html(ajaxRequest.responseText);");
}
function ajaxPostBuyer()
{
	ajaxFunctionpost("buyPreview.php","buyer_registration", "$('#pagep').html(ajaxRequest.responseText);");
}

function ajaxFunctionpost(requestPage,fid, responseAssign){

	var ajaxRequest;  // The variable that makes Ajax possible!

var fd="";
if(typeof(FormData) == 'undefined')
{
  // This browser does not have native FormData support. Use the FormDataCompatibility
  // class which implements the needed fucncitonlity foro building multi part HTTP POST requests
  var fd = new FormDataCompatibility(document.getElementById(fid));
} else {
  var fd = new FormData(document.getElementById(fid));
}

		try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();

	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e){
				alert("Your browser broke!");
				return false;
			}
		}
	}

	// Create a function that will receive data sent from the server
	ajaxRequest.onreadystatechange = function(){
		if(ajaxRequest.readyState == 4){

			eval(responseAssign);
		}
	}

	ajaxRequest.open("POST", requestPage, true);


	if(typeof(FormData) == 'undefined'){
	  fd.setContentTypeHeader(ajaxRequest);
	  ajaxRequest.sendAsBinary(fd);
	} else {
	  ajaxRequest.send(fd);
	}

}

function getTicketDetail(tid,did,dmode)
{
	ajaxfunction("query/getTicketDetail.php?dmode="+dmode+"&tid="+tid+"&did="+did, "document.getElementById('all').innerHTML = ajaxRequest.responseText;");
}

function getDetail()
{
		val=$('#hidchoice').val();
		mode=$('#hidmode').val();
		
	if(mode<=4)
	{
		$('.user_menu').removeClass("menu-item menu-item-type-post_type menu-item-object-page menu-item-747");
		$('#menu'+mode).addClass("menu-item menu-item-type-custom menu-item-object-custom  current  current_page_item menu-item-home menu-item-483 first");
		ajaxfunction("query/ajaxRegistrationDetails.php?mode="+mode+"&user="+val, "document.getElementById('all').innerHTML = ajaxRequest.responseText;");
	}
	else
	{
		location.replace('pata_user_ticket.php');
	}
	if(val == 1)
	{
		$('.del_menu').removeClass("active");
		$('#menu5').addClass("del_menu active");
		ajaxfunction("query/ajaxRegistrationDetails.php?mode="+mode+"&user="+val, "document.getElementById('all').innerHTML = ajaxRequest.responseText;");
	}
	else if(val == 2)
	{
		$('.del_menu').removeClass("active");
		$('#menu6').addClass("del_menu active");
		ajaxfunction("query/ajaxRegistrationDetails.php?mode="+mode+"&user="+val, "document.getElementById('all').innerHTML = ajaxRequest.responseText;");
	}
	else if(val == 3)
	{
		$('.del_menu').removeClass("active");
		$('#menu7').addClass("del_menu active");
		ajaxfunction("query/createUser.php", "document.getElementById('all').innerHTML = ajaxRequest.responseText;");
	}
}

function getRegistration(mode,id)
{
	if(mode == 1)
	{
		ajaxfunction("seller_preview.php?id="+id, "document.getElementById('ajax"+id+"').innerHTML = ajaxRequest.responseText;");
		$('.ajaxdiv').css("display","none");
		$('#ajax'+id).css("display","block");
	}
	else
	{
		ajaxfunction("buyer_preview.php?id="+id, "document.getElementById('ajax"+id+"').innerHTML = ajaxRequest.responseText;");
		$('.ajaxdiv').css("display","none");
		$('#ajax'+id).css("display","block");
	}
}
function chkpata(val)
{
	if(val == 1)
	{
		$("#patayear_table").css('display', 'none');
	}
	else
	{
		$("#patayear_table").css('display', '');		
	}
}
function seller_agree()
{
	if($('#chkagree').prop('checked'))
	{
		
		$("#butnext").attr('disabled', false);		
	}
	else
	{
		$("#butnext").attr('disabled', true);				
	}
}
function seller_agree1()
{
	if($('#chkagree').prop('checked'))
	{
		
		$(".submit").attr('disabled', false);		
	}
	else
	{
		$(".submit").attr('disabled', true);				
	}
}
function buyer_agree()
{
	if($('#chkagree').prop('checked'))
	{
		$("#butsubmit").attr('disabled', false);		
	}
	else
	{
		$("#butsubmit").attr('disabled', true);				
	}
}

function buyer_agree1()
{
	if($('#chkagree').prop('checked'))
	{
		$(".submit").attr('disabled', false);		
	}
	else
	{
		$(".submit").attr('disabled', true);				
	}
}

function chkpay(val)
{	
	if(document.frmData.CNT_ID.value != '37')
	{
		if(val != '')
		{
			ajaxfunction("query/ajaxPayment.php?val1="+val, "chk(ajaxRequest.responseText);");
		}
		else
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package B (Hotel - No Air)", "B", false,false);
			document.frmData.Package_A.options[2]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			$('#hid_disc_type').val('D');
			$('#hid_disc_val').val('0');
			calculatePrice();
			$('#discountDesc').text("");
		}
		/*else
		{
			$('#hid_disc_type').val('D');
			$('#hid_disc_val').val('0');
			alert('Please Enter Proper Reference Code to Get Discounted Rates');
			document.frmData.refer_code.value="";
			document.frmData.refer_code.focus();
			calculatePrice();
		}*/
	}
}
function chkpayCountry(val)
{	
	ajaxfunction("query/ajaxPayment1.php?val1="+val, "chkCountry(ajaxRequest.responseText);");
}
function chkpayCountrySeller(val)
{	
	ajaxfunction("query/ajaxPayment1.php?val1="+val, "chkCountrySeller(ajaxRequest.responseText);");
}
function userList(id)
{
	ajaxfunction("query/editUser.php?id="+id, "document.getElementById('user').innerHTML = ajaxRequest.responseText;");
}
function chk(op)
{
	res = op.split("_"); 
	if(res[0].indexOf("Reimb") !== -1)
	{
		$('#hid_disc_type').val('D');
		$('#hid_disc_val').val('0');
	}
	else
	{
		$('#hid_disc_type').val('R');
		$('#hid_disc_val').val(res[0]);
	}
	
	if(res[1] == 1)
	{
		$('#hidDiscount').css('display','block');
		$('#discountDesc').text(res[2]);
		
		
		if (res[3] == "A")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "B")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package B (Hotel - No Air)", "B", false,true);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "C")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package C (NO Air and accommodation included)", "C", false,true);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "none");
		}
		else if (res[3] == "AB")
		{
			
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package B (Hotel - No Air)", "B", false,false);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "BC")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package B (Hotel - No Air)", "B", false,true);
			document.frmData.Package_A.options[1]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "AC")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package B (Hotel - No Air)", "B", false,false);
			document.frmData.Package_A.options[2]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
	}
	else
	{
		$('#hid_disc_type').val('D');
		$('#hid_disc_val').val('0');
		$('#hidDiscount').css('display','none');
		$('#discountDesc').text('');
		alert('Please Enter Proper Reference Code to Get Discounted Rates');
		document.frmData.refer_code.value="";
		document.frmData.refer_code.focus();
	}
	
	calculatePrice();
}

function chkCountry(op)
{
	res = op.split("_"); 
	if(res[1] == 1)
	{
		$('#hidDiscount').css('display','block');
		$('#discountDesc').text(res[2]);
		$('#hid_disc_type').val('R');
		$('#hid_disc_val').val(res[0]);
		
		if (res[3] == "A")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "B")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package B (Hotel - No Air)", "B", false,true);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "C")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package C (NO Air and accommodation included)", "C", false,true);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "none");
		}
		else if (res[3] == "AB")
		{
			
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package B (Hotel - No Air)", "B", false,false);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "BC")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package B (Hotel - No Air)", "B", false,true);
			document.frmData.Package_A.options[1]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else if (res[3] == "AC")
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "none");
			$("#secEDiv").css("display", "");
		}
		else
		{
			document.frmData.Package_A.options.length=0;
			document.frmData.Package_A.options[0]=new Option("Package A (Air & Hotel)", "A", false,true);
			document.frmData.Package_A.options[1]=new Option("Package B (Hotel - No Air)", "B", false,false);
			document.frmData.Package_A.options[2]=new Option("Package C (NO Air and accommodation included)", "C", false,false);
			
			$("#secDDiv").css("display", "");
			$("#secEDiv").css("display", "");
		}
		
	}
	else
	{
		
		$('#hidDiscount').css('display','none');
		$('#discountDesc').text('');
		$('#hid_disc_type').val('D');
		
		chkpay($("#refer_code").val());
		
	}
	
	calculatePrice();
}
function chkCountrySeller(op)
{
	res = op.split("_"); 
	if(res[1] == 1)
	{
		$('#hid_disc_type').val('dis');
		$('#hid_disc_val').val('0.8');
		calculcateSpace('dis');
	}
}
function checkPackageCost()
{
	pmember=$('#hidpmember').val();
	if(pmember == 1)
	{
		$('#delegate1_fee_c').val('1000');
	}
	else 
	{
		$('#delegate1_fee_c').val('1200');
	}
}
function cancelUser()
{
	$('#butcancel').css("display","none");
	$('#butsubmit').css("width","300px");
	$('#txtfname').val("");
	$('#txtlname').val("");
	$('#txtuname').val("");
	$('#txtpword').val("");
	$('#txtfname').focus();
}
function checkPrice()
{	
	var pac_a=0;
	var pac_b=0;
	var pac_c=0;
	var pac_spouse=0;
	var late=0;
	
	if ($('#package_a_price').length > 0)
	{
		pac_a=parseInt($('#package_a_price').val().trim());
			if(isNaN(pac_a))
			{
				pac_a=0;
			}
	}

	if ($('#package_b_price').length > 0)
	{
		pac_b=parseInt($('#package_b_price').val().trim());
			if(isNaN(pac_b))
			{
				pac_b=0;
			}

	}

	if ($('#package_c_price').length > 0)
	{
		pac_c=parseInt($('#package_c_price').val().trim());
			if(isNaN(pac_c))
			{
				pac_c=0;
			}

	}

	if ($('#package_spouse_price').length > 0)
	{
		pac_spouse=parseInt($('#package_spouse_price').val().trim());
			if(isNaN(pac_spouse))
			{
				pac_spouse=0;
			}

	}

	if ($('#late_fee_price').length > 0)
	{
		late=parseInt($('#late_fee_price').val().trim());
			if(isNaN(late))
			{
				late=0;
			}

	}

	var bf=0;
	if ($('#bank_Fee').length > 0)
	{
		bf=parseInt($('#bank_Fee').val().trim());
			if(isNaN(bf))
			{
				bf=0;
			}

	}
		

	var pac=parseInt(pac_a)+parseInt(pac_b)+parseInt(pac_c)+parseInt(pac_spouse);
	
	late=parseInt(pac)-parseInt(late);
	
	var st=parseInt(late)+parseInt(bf);
	
	$('#st').text(st);
	$('#subtotal_pay').val(st);
	

	var cf=0;
	if ($('#climate_fee_value').length > 0)
	{
		cf=parseInt($('#climate_fee_value').val().trim());
			if(isNaN(cf))
			{
				cf=0;
			}

	}
	
	var tf1=parseInt(st)+parseInt(cf);
	
	$('#tf1').val(tf1);
	$('#tf').val(tf1);
	
}

function price()
{
	if($('#hidpavtype').val() == '0')
	{
		if($('#hidchkspace').val() == 'S')
		{
			var spcA=0;
			var spcB=0;
			var loy=0;
			
			if ($('#space_price_a').length > 0)
			{
				spcA=parseInt($('#space_price_a').val().trim());
					if(isNaN(spcA))
					{
						spcA=0;
					}

			}
			if ($('#booth_space_noapp_A').length > 0)
			{
				spcB=parseInt($('#booth_space_noapp_A').val().trim());
					if(isNaN(spcB))
					{
						spcB=0;
					}

			}
			if ($('#hidLoyalty').length > 0)
			{
				loy=parseInt($('#hidLoyalty').val().trim());
				if(isNaN(loy))
				{
					loy=0;
				}

			}
			
			var dec=((parseInt(spcA)+parseInt(spcB))-parseInt(loy));
			
			$('#bst').text(dec);
			
			var fsd1=0;
			var fsd2=0;
			var fsd3=0;
			
			if ($('#delegate1_fee_a').length > 0)
			{
				fsd1=parseInt($('#delegate1_fee_a').val().trim());
					if(isNaN(fsd1))
					{
						fsd1=0;
					}

			}
			if ($('#delegate2_fee_a').length > 0)
			{
				fsd2=parseInt($('#delegate2_fee_a').val().trim());
					if(isNaN(fsd2))
					{
						fsd2=0;
					}

			}
			if ($('#delegate3_fee_a').length > 0)
			{
				fsd3=parseInt($('#delegate3_fee_a').val().trim());
					if(isNaN(fsd3))
					{
						fsd3=0;
					}

			}

			var bf=0;
			var rf=0;
			var cf=0;
			
			if ($('#hidbankfee').length > 0)
			{
				bf=parseInt($('#hidbankfee').val().trim());
				if(isNaN(bf))
				{
					bf=0;
				}
				
			}
			if ($('#latefee_price_a').length > 0)
			{
				rf=parseInt($('#latefee_price_a').val().trim());
					if(isNaN(rf))
					{
						rf=0;
					}

			}
			if ($('#climate_fee_value_a').length > 0)
			{
				cf=parseInt($('#climate_fee_value_a').val().trim());
					if(isNaN(cf))
					{
						cf=0;
					}

			}
			
			$('#st').text((parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf)+parseInt(dec));
			
			var tf=(parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf)+parseInt(cf)+parseInt(dec);
			$('#tot_amt_a').val(tf);
			$('#tap').html(tf);
		}
		else if($('#hidchkspace').val() == 'R')
		{
			var spcA=0;
			var spcB=0;
			var spcC=0;
			var spcD=0;
			var loy=0;
			
			if ($('#space_price_b').length > 0)
			{
				spcA=parseInt($('#space_price_b').val().trim());
					if(isNaN(spcA))
					{
						spcA=0;
					}

			}
			if ($('#space_price_noapp_b').length > 0)
			{
				spcB=parseInt($('#space_price_noapp_b').val().trim());
					if(isNaN(spcB))
					{
						spcB=0;
					}

			}
			if ($('#space_price_add_b').length > 0)
			{
				spcC=parseInt($('#space_price_add_b').val().trim());
					if(isNaN(spcC))
					{
						spcC=0;
					}

			}
			if ($('#space_price_addnoapp_b').length > 0)
			{
				spcD=parseInt($('#space_price_addnoapp_b').val().trim());
					if(isNaN(spcD))
					{
						spcD=0;
					}

			}
			if ($('#hidLoyalty').length > 0)
			{
				loy=parseInt($('#hidLoyalty').val().trim());
					if(isNaN(loy))
					{
						loy=0;
					}

			}
			
			var dec=((parseInt(spcA)+parseInt(spcB)+parseInt(spcC)+parseInt(spcD))-parseInt(loy));
			
			$('#bst').text(dec);
			
			var fsd1=0;
			var fsd2=0;
			var fsd3=0;
			
			if ($('#delegate1_fee_b').length > 0)
			{
				fsd1=parseInt($('#delegate1_fee_b').val().trim());
					if(isNaN(fsd1))
					{
						fsd1=0;
					}

			}
			if ($('#delegate2_fee_b').length > 0)
			{
				fsd2=parseInt($('#delegate2_fee_b').val().trim());
					if(isNaN(fsd2))
					{
						fsd2=0;
					}

			}
			if ($('#delegate3_fee_b').length > 0)
			{
				fsd3=parseInt($('#delegate3_fee_b').val().trim());
					if(isNaN(fsd3))
					{
						fsd3=0;
					}

			}
			
			
			var bf=0;
			var rf=0;
			var cf=0;
			
			if ($('#hidbankfee').length > 0)
			{
				bf=parseInt($('#hidbankfee').val().trim());
				if(isNaN(bf))
				{
					bf=0;
				}
				
			}
			if ($('#latefee_price_b').length > 0)
			{
				rf=parseInt($('#latefee_price_b').val().trim());
					if(isNaN(rf))
					{
						rf=0;
					}

			}
			if ($('#climate_fee_value_b').length > 0)
			{
				cf=parseInt($('#climate_fee_value_b').val().trim());
					if(isNaN(cf))
					{
						cf=0;
					}

			}
			
			$('#st').text((parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf)+parseInt(dec));
			
			var tf=(parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf)+parseInt(cf)+parseInt(dec);
			$('#tot_amt_b').val(tf);
			$('#tap').html(tf);
		}
	}
	else
	{
			

		var fsd1=0;
		var fsd2=0;
		var fsd3=0;
		
		if ($('#delegate1_fee_c').length > 0)
		{
			fsd1=parseInt($('#delegate1_fee_c').val().trim());
				if(isNaN(fsd1))
				{
					fsd1=0;
				}

		}
		if ($('#delegate2_fee_c').length > 0)
		{
			fsd2=parseInt($('#delegate2_fee_c').val().trim());
				if(isNaN(fsd2))
				{
					fsd2=0;
				}

		}
		if ($('#delegate3_fee_c').length > 0)
		{
			fsd3=parseInt($('#delegate3_fee_c').val().trim());
				if(isNaN(fsd3))
				{
					fsd3=0;
				}

		}
		
		var bf=0;
		var rf=0;
		var cf=0;
		
		if ($('#hidbankfee').length > 0)
		{
			bf=parseInt($('#hidbankfee').val().trim());
			if(isNaN(bf))
			{
				bf=0;
			}
			
		}
		if ($('#latefee_price_c').length > 0)
		{
			rf=parseInt($('#latefee_price_c').val().trim());
				if(isNaN(rf))
				{
					rf=0;
				}

		}
		if ($('#climate_fee_value_c').length > 0)
		{
			cf=parseInt($('#climate_fee_value_c').val().trim());
				if(isNaN(cf))
				{
					cf=0;
				}

		}
		
		$('#st').text((parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf));
		
		var tf=(parseInt(fsd1)+parseInt(fsd2)+parseInt(fsd3))+parseInt(bf)+parseInt(rf)+parseInt(cf);
		$('#tot_amt_c').val(tf);
		$('#tap').html(tf);
	}
	
}

 function PrintElem(elem)
 {
    Popup($(elem).html());
 }

    function Popup(data) 
    {
        var mywindow = window.open('', 'my div', 'height=400,width=600');
        mywindow.document.write('<html><head><title>my div</title>');
		mywindow.document.write('<link href="css/main.css" rel="stylesheet" type="text/css">');
		mywindow.document.write('<link rel="stylesheet" href="demo/all.css" type="text/css" media="all">');
		mywindow.document.write('<script src="demo/all.js" type="text/javascript"></script>');
		mywindow.document.write('<script src="js/jquery-1.9.1.min.js"></script>');
		mywindow.document.write('<script src="js/main.js"></script>');
        mywindow.document.write('</head><body >');
        mywindow.document.write(data);
        mywindow.document.write('</body></html>');

        mywindow.print();
        mywindow.close();

        return true;
    }


function checkPage(num)
{
	//$('.page').css('display','block');
	if(num == 'p')
	{
		$('.page').css('display','block');
		$('#page0').css('display','none');
		$('#page5').css('display','none');
		$('#page4button').css('display','none');
		$('#pagep').css('display','block');
		$('html, body').animate({ scrollTop: 0 }, 'fast');
	}
	else
	{
		$('.page').css('display','none');
		$('#page4button').css('display','block');
		$('#page'+num).css('display','block');
		$('html, body').animate({ scrollTop: 0 }, 'fast');
	}
}

function hideDiscount(num)
{
	if(num == 1)
	{
		$('#hidIndiaDiscA').css('display','none');
		$('#hidIndiaDiscB').css('display','none');
		$('#hidIndiaDiscAmtA').css('display','none');
		$('#hidIndiaDiscAmtB').css('display','none');
	}
	else if(num == 0)
	{
		$('#hidIndiaDiscA').css('display','block');
		$('#hidIndiaDiscB').css('display','block');
		$('#hidIndiaDiscAmtA').css('display','block');
		$('#hidIndiaDiscAmtB').css('display','block');
	}
}


function editSection(wizardDiv, step, scrolltop, top)
{
	$('#' + wizardDiv).easyWizard('goToStep', step);
	
	if (scrolltop)
	{
		$('html, body').animate({ scrollTop: top }, 'fast');
	}
	else
	{
		$('html, body').animate({ scrollBottom: top }, 'fast');
	}
}
function showReceipt(id)
{
	window.open("receipt.php?mode=1&id="+id,'_blank');
	//location.replace("receipt.php?mode=1&id="+id);
}
function showInvoice(id)
{
	window.open("invoice.php?mode=1&id="+id,'_blank');
	//location.replace("invoice.php?mode=1&id="+id);
}
function showDiv(id)
{
	$('.divId').css('display','none');
	$('#divId'+id).css('display','block');
}
function hideDiv(id)
{
	$('#divId'+id).css('display','none');
}
function advanceBuyerList(mode)
{
	var hidid=$('#hidid').val();
	var selcompany=$('#selcompany').val();
	var selcountry=$('#selcountry').val();
	var selbuyer=$('#selbuyer').val();
	var selbuyprofile=$('#selbuyprofile').val();
	var svalue=$('#svalue').val();
	
	if(mode == 1)
	{
		ajaxfunction("query/advanceBuyerList.php?selbuyprofile="+selbuyprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selbuyer="+selbuyer+"&selcountry="+selcountry, "ajax(ajaxRequest.responseText,'1');initTableSorter();");
	}
	else if(mode == 2)
	{
		ajaxfunction("query/appointmentRequestBuyerList.php?selbuyprofile="+selbuyprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selbuyer="+selbuyer+"&selcountry="+selcountry, "ajax(ajaxRequest.responseText,'2');initTableSorter();");
	}
	else if(mode == 3)
	{
		ajaxfunction("query/advanceBuyerCancellationList.php?selbuyprofile="+selbuyprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selbuyer="+selbuyer+"&selcountry="+selcountry, "ajax(ajaxRequest.responseText,'3');initTableSorter();");
	}
	else if(mode == 4)
	{
		ajaxfunction("query/advanceNewBuyerList.php?selbuyprofile="+selbuyprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selbuyer="+selbuyer+"&selcountry="+selcountry, "ajax(ajaxRequest.responseText,'4');initTableSorter();");
	}
}
function ajax(op,mode, type)
{
	
	document.getElementById('ajaxResult').innerHTML = op;
	$('#totSpan').html($('#hidcount').val());

	if(mode == 2)
	{
		
		if($('#hidcountchk').val() == 40)
		{
			$('#butsave').attr('disabled',false);
		}
	}
	if(mode == 5)
	{
		if(($(type).val() == 3 && $('#hidcount').val() == 20) || $('#hidcount').val() == 40)
		{
			$('#butsubmit').attr('disabled',false);
		}
	}
}
function advanceSellerList(mode)
{
	var hidid=$('#hidid').val();
	var selcompany=$('#selcompany').val();
	var selcountry=$('#selcountry').val();
	var selseller=$('#selseller').val();
	var selselprofile=$('#selselprofile').val();
	var svalue=$('#svalue').val();;
	if(mode == 1)
	{
		ajaxfunction("query/advanceSellerList.php?selselprofile="+selselprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selseller="+selseller+"&selcountry="+selcountry,"ajax(ajaxRequest.responseText,'1');initTableSorter();");
	}
	else if(mode == 2)
	{
		ajaxfunction("query/appointmentRequestSellerList.php?selselprofile="+selselprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selseller="+selseller+"&selcountry="+selcountry,"ajax(ajaxRequest.responseText,'2');initTableSorter();");
	}
	else if(mode == 3)
	{
		ajaxfunction("query/advanceSellerCancellationList.php?selselprofile="+selselprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selseller="+selseller+"&selcountry="+selcountry,"ajax(ajaxRequest.responseText,'3');initTableSorter();");
	}
	else if(mode == 4)
	{
		ajaxfunction("query/advanceNewSellerList.php?selselprofile="+selselprofile+"&id="+hidid+"&svalue="+svalue+"&selcompany="+selcompany+"&selseller="+selseller+"&selcountry="+selcountry,"ajax(ajaxRequest.responseText,'4');initTableSorter();");
	}

}
function moveRow(arrow)
{
	$row = $(arrow).parents("tr:first");
	if ($(arrow).children('i:first').hasClass("firstInList"))
	{
		while ($row.prev().is("tr"))
		{
			$swapRow = $row.prev();

			$rowPr = $row.children('td:first');
			$sRowPr = $swapRow.children('td:first');

			var cont = $rowPr.text();
			$rowPr.text($sRowPr.text());
			$sRowPr.text(cont);

			$row.insertBefore($swapRow);
			
			$rid = $("#hi" + $row.attr("id"));
			$sRid = $("#hi" + $swapRow.attr("id"));
			
			$rname = $rid.attr("name");
			$sRname = $sRid.attr("name");
			
			$rid.attr("name", $sRname);
			$sRid.attr("name", $rname);
		}
	}
	else if ($(arrow).children('i:first').hasClass("lastInList"))
	{
		while ($row.next().is("tr"))
		{
			$swapRow = $row.next();

			$rowPr = $row.children('td:first');
			$sRowPr = $swapRow.children('td:first');

			var cont = $rowPr.text();
			$rowPr.text($sRowPr.text());
			$sRowPr.text(cont);

			$row.insertAfter($swapRow);
			
			$rid = $("#hi" + $row.attr("id"));
			$sRid = $("#hi" + $swapRow.attr("id"));
			
			$rname = $rid.attr("name");
			$sRname = $sRid.attr("name");
			
			$rid.attr("name", $sRname);
			$sRid.attr("name", $rname);
		}
	}
	else if ($(arrow).children('i:first').hasClass("fa-arrow-up"))
	{
		if ($row.prev().is("tr"))
		{
			$swapRow = $row.prev();

			$rowPr = $row.children('td:first');
			$sRowPr = $swapRow.children('td:first');

			var cont = $rowPr.text();
			$rowPr.text($sRowPr.text());
			$sRowPr.text(cont);

			$row.insertBefore($swapRow);
		
			$rid = $("#hi" + $row.attr("id"));
			$sRid = $("#hi" + $swapRow.attr("id"));
		
			$rname = $rid.attr("name");
			$sRname = $sRid.attr("name");
		
			$rid.attr("name", $sRname);
			$sRid.attr("name", $rname);
		}
	}
	else if ($(arrow).children('i:first').hasClass("fa-arrow-down"))
	{
		if ($row.next().is("tr"))
		{
			$swapRow = $row.next();

			$rowPr = $row.children('td:first');
			$sRowPr = $swapRow.children('td:first');

			var cont = $rowPr.text();
			$rowPr.text($sRowPr.text());
			$sRowPr.text(cont);

			$row.insertAfter($swapRow);
		
			$rid = $("#hi" + $row.attr("id"));
			$sRid = $("#hi" + $swapRow.attr("id"));
		
			$rname = $rid.attr("name");
			$sRname = $sRid.attr("name");
		
			$rid.attr("name", $sRname);
			$sRid.attr("name", $rname);
		}
	}
}

function deleteRow(trash)
{
	if(confirm('Are you Sure?'))
	{
		$row = $(trash).parents("tr:first");
		$row.remove();
	}
}


function buyerchkbox(bcid,mode,cnt, chk)
{
	if(!chk.checked)
	{
		removebox(bcid, cnt, 'B');
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 20)
			{ 
				ajaxfunction("query/tempRequestBuyerList.php?id="+bcid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Limit Upto 20 Buyers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			}
		}
		else
		{
			if($('#hidcountchk').val() < 40)	
			{ 
				ajaxfunction("query/tempRequestBuyerList.php?id="+bcid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Limit upto 40 Buyers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			} 
		}
	}
	//advanceBuyerList('2');
}

function sellerchkbox(scid,mode,cnt, chk)
{
	if(!chk.checked)
	{
		removebox(scid, cnt, 'S');
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 20)
			{ 
				ajaxfunction("query/tempRequestSellerList.php?id="+scid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Limit Upto 20 Sellers Only'); 
				$('#butsave').attr('disabled',false);
				chk.checked = false;
			}
		}
		else
		{
			if($('#hidcountchk').val() < 40)	
			{ 
				ajaxfunction("query/tempRequestSellerList.php?id="+scid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Limit upto 40 Sellers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			} 
		}
	}
	//advanceSellerList('2');
}

function removebox(id,cnt,mode)
{
	if(mode == 'B')
	{
		ajaxfunction("query/deleteBuyerRequest.php?mode=1&id="+id,"$('#hidcountchk').val(ajaxRequest.responseText);");
		$('#butsave').attr('disabled',true); 
		//advanceBuyerList('2');
	}
	else
	{
		ajaxfunction("query/deleteSellerRequest.php?mode=1&id="+id,"$('#hidcountchk').val(ajaxRequest.responseText);");
		$('#butsave').attr('disabled',true); 
		//advanceSellerList('2');
	}

}

function buyerchklink(link,bcid,mode,cnt, chk)
{
	if(chk.checked)
	{
		location.replace(link);
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 20)
			{ 
				location.replace(link);
			} 
			else 
			{ 
				alert('Limit Upto 20 Buyers Only'); 
				$('#butsave').attr('disabled',false); 
			}
		}
		else
		{
			if($('#hidcountchk').val() < 40)	
			{ 
				location.replace(link);
			} 
			else 
			{ 
				alert('Limit upto 40 Buyers Only'); 
				$('#butsave').attr('disabled',false);
			} 
		}
	}
return false;
	//advanceBuyerList('2');
}

function sellerchklink(link,scid,mode,cnt, chk)
{
	if(chk.checked)
	{
		location.replace(link);
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 20)
			{ 
				location.replace(link);
			} 
			else 
			{ 
				alert('Limit Upto 20 Sellers Only'); 
				$('#butsave').attr('disabled',false);
			}
		}
		else
		{
			if($('#hidcountchk').val() < 40)	
			{ 
				location.replace(link);
			} 
			else 
			{ 
				alert('Limit upto 40 Sellers Only'); 
				$('#butsave').attr('disabled',false); 
			} 
		}
	}
return false;
	//advanceSellerList('2');
}

function buyerrejbox(bcid,mode,cnt, chk)
{
	if(!chk.checked)
	{
		removerejbox(bcid, cnt, 'B');
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 5)
			{ 
				ajaxfunction("query/rejectRequest.php?mode=1&id="+bcid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Rejection Limit Upto 5 Buyers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			}
		}
		else
		{
			if($('#hidcountchk').val() < 10)	
			{ 
				ajaxfunction("query/rejectRequest.php?mode=1&id="+bcid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Rejection Limit Upto 10 Buyers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			} 
		}
	}
	//advanceBuyerList('2');
}

function sellerrejbox(scid,mode,cnt, chk)
{
	if(!chk.checked)
	{
		removerejbox(scid, cnt, 'S');
	}
	else
	{
		if(mode == 1)
		{
			if($('#hidcountchk').val() < 5)
			{ 
				ajaxfunction("query/rejectRequest.php?mode=2&id="+scid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Rejection Limit Upto 5 Sellers Only'); 
				$('#butsave').attr('disabled',false);
				chk.checked = false;
			}
		}
		else
		{
			if($('#hidcountchk').val() < 10)	
			{ 
				ajaxfunction("query/rejectRequest.php?mode=2&id="+scid+"&chk=y","$('#hidcountchk').val(ajaxRequest.responseText);");
			} 
			else 
			{ 
				alert('Rejection Limit Upto 10 Sellers Only'); 
				$('#butsave').attr('disabled',false); 
				chk.checked = false;
			} 
		}
	}
	//advanceSellerList('2');
}

function removerejbox(id,cnt,mode)
{
	if(mode == 'B')
	{
		ajaxfunction("query/UnrejectRequest.php?mode=1&id="+id,"$('#hidcountchk').val(ajaxRequest.responseText);");
		$('#butsave').attr('disabled',true); 
		//advanceBuyerList('2');
	}
	else
	{
		ajaxfunction("query/UnrejectRequest.php?mode=2&id="+id,"$('#hidcountchk').val(ajaxRequest.responseText);");
		$('#butsave').attr('disabled',true); 
		//advanceSellerList('2');
	}

}