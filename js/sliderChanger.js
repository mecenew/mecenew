var slideNow = 9;// 1-9
function slideShow(elem){
	$('#tabs'+slideNow).css('display','none');
	$('#tabs'+elem).css('display','block');
	slideNow = elem;
}
