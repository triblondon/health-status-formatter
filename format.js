
if (typeof Showdown !== 'undefined') {
	var converter = new Showdown.converter();
	$('.check table td').each(function() {
		var pattern = /\b((?:https?|ftp|file):\/\/)([-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\/%=~_|])/ig;
		var html = $(this).text().replace(pattern, "<a href='$&'>$2</a>");
		html = converter.makeHtml(html);
		$(this).html(html);
	});
}

if (typeof moment !== 'undefined') {
	$('time').each(function() {
		$(this).html(moment($(this).attr('datetime')).fromNow());
	});
}
