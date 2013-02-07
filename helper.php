<?php
function json_encode_cyr($str) {
    $trans = array(
	'\u0430'=>'а', '\u0431'=>'б', '\u0432'=>'в', '\u0433'=>'г',
	'\u0434'=>'д', '\u0435'=>'е', '\u0451'=>'ё', '\u0436'=>'ж',
	'\u0437'=>'з', '\u0438'=>'и', '\u0439'=>'й', '\u043a'=>'к',
	'\u043b'=>'л', '\u043c'=>'м', '\u043d'=>'н', '\u043e'=>'о',
	'\u043f'=>'п', '\u0440'=>'р', '\u0441'=>'с', '\u0442'=>'т',
	'\u0443'=>'у', '\u0444'=>'ф', '\u0445'=>'х', '\u0446'=>'ц',
	'\u0447'=>'ч', '\u0448'=>'ш', '\u0449'=>'щ', '\u044a'=>'ъ',
	'\u044b'=>'ы', '\u044c'=>'ь', '\u044d'=>'э', '\u044e'=>'ю',
	'\u044f'=>'я',	
	'\u0410'=>'А', '\u0411'=>'Б', '\u0412'=>'В', '\u0413'=>'Г',
	'\u0414'=>'Д', '\u0415'=>'Е', '\u0401'=>'Ё', '\u0416'=>'Ж',
	'\u0417'=>'З', '\u0418'=>'И', '\u0419'=>'Й', '\u041a'=>'К',
	'\u041b'=>'Л', '\u041c'=>'М', '\u041d'=>'Н', '\u041e'=>'О',
	'\u041f'=>'П', '\u0420'=>'Р', '\u0421'=>'С', '\u0422'=>'Т',
	'\u0423'=>'У', '\u0424'=>'Ф', '\u0425'=>'Х', '\u0426'=>'Ц',
	'\u0427'=>'Ч', '\u0428'=>'Ш', '\u0429'=>'Щ', '\u042a'=>'Ъ',
	'\u042b'=>'Ы', '\u042c'=>'Ь', '\u042d'=>'Э', '\u042e'=>'Ю',
	'\u042f'=>'Я');
    return strtr( json_encode($str), $trans);
}
function trans($range){
	$arr= array();	
	foreach($range as $v) {
		$bin = decbin($v);
		while(strlen($bin)<8) {$bin = substr_replace($bin, '0',0,0);}
		$arr[]=array('char'=>iconv("CP1251", "UTF-8",chr($v)), 'bin'=>$bin);
	}
	return $arr;
}
function getAsci(){
	$rus_b = range('192', '223');
	$rus_s = range('224', '255');
	$eng_b = range('65', '90');
	$eng_s = range('97', '122');
	$digits= trans(range('48','57'));
	$other = array_merge(trans(range('32', '47'), trans(range('91', '96'))));
	$rus = array('big'=>trans($rus_b), 'sm'=>trans($rus_s));
	$eng = array('big'=>trans($eng_b), 'sm'=>trans($eng_s));
	return json_encode(array('rus'=>$rus, 'eng'=>$eng, 'other'=>$other, 'dig'=>$digits));
}
function uniord($str) { 
	$str = iconv("UTF-8", "CP1251//IGNORE", $str);
	$arr=array();
	$dlina= strlen ($str);
	$i=0;
	while ($i<$dlina) {
		$res = iconv("CP1251", "UTF-8", $str{$i});
		$bin = decbin( ord( $str{$i} ) );
		while(strlen($bin)<8) {$bin = substr_replace($bin, '0',0,0);}
		if($bin!=='00000000') $arr[] = array( $res =>  $bin);
		$i++;
	}
	return json_encode_cyr($arr);
}
function orduni($str){

	$dlina= count($str);
	$arr=array();
	$j=0;
	for($i=0; $i<$dlina; $i++) {
		$i%8==0? $j++: '';
		$arr[$j][]=$str[$i];
	}
	foreach($arr as $i=>$v) {
		$dec = bindec(implode($v));
		if(($dec>31&&$dec<58)||($dec>64&&$dec<123)||($dec>191&&$dec<256)) {
			$dec = iconv("CP1251", "UTF-8", chr($dec));
		} else {
			$dec='';
		}
		$arr[$i] = $dec;
	};
	return json_encode(implode($arr));
}
$str = $_POST['data'];
$res = $_POST['task']=='to'? uniord($str): ( $_POST['task']=='from'? orduni($str): getAsci());

echo $res;

?>
