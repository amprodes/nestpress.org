
jQuery(document).ready(function(){
	avia_modify_external_link_target();
});


function avia_modify_external_link_target()
{
	try
	{
		if (top.location != location) { jQuery("a[href^='http']").not("[href*='"+location.host+"']").attr('target','_blank'); }
	}
	catch(err)
	{
	
	}
	
}