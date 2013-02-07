	
var hide = {
	form: {},
	str: '',
	ww:[],
	bin:[]
}
var show = {
	form: {},
	str: '',
	ww:[],
	bin:[],
	bin3:[]
}
var oborotni = {
	rus: ['А','В','Е','К','М','Н','О','Р','С','Т','Х','а','е','о','р','с','у','х'],
	eng: ['A','B','E','K','M','H','O','P','C','T','X','a','e','o','p','c','y','x'],
	
	/*---------Определяем форму вызвавшую событие-----------*/
	whatForm: function($this) {
		return $this.parents('.main_form').attr('id')=='to'? hide: show;			
	},
	
	/*---------- Кодируем инпут -----------*/
	getBin: function(obj) {
		var VResult = obj.form.find('.input_field').val();
		var spaces = obj.form.find('.spaces:checked').val();
		var size = obj.form.find('.inres .size');
		if (spaces=='ye') {
			var VRegExp = new RegExp(/(\s|\u00A0)/g); 
			VResult = VResult.replace(VRegExp, '');
		} 
		$.post(
			'helper.php',
			{ 'data' : VResult, 'task':'to' },
			function(data) {			
				obj.bin=[];				
				size.html('');
				$.each(data, function(i, v) {
					$.each(v, function(j,va) {
						size.html( size.html()+va+' ' );
						obj.bin.push(va.split(''));
					});
				});
				obj.form.find('.byteCount').text(obj.bin.length*8);	
				oborotni.checkSize('in', obj);						
			}, 
			'json'
		);
	},
	
	/*---------- Ищем оборотней -----------*/
	findOb: function (obj) {
		var ind = 0, i=0, val, chr,
            str=obj.str, str_arr=str.split(''),
            isShow = obj == show,

            lang1, lang2,
            lang=obj.form.find('.lang').val(),
            all = '/|'+this.rus.join('|')+'|'+this.eng.join('|')+'|/';

        if(lang=='eng'){
            lang1=this.rus;
            lang2=this.eng;
        } else {
            lang1=this.eng;
            lang2=this.rus;
        }

        obj.ww = [];
		while( ind >= 0 ) {
			ind = str.search(all);
			if ( ind > -1 ){
                chr = str.charAt(ind);
				val = i==0? ind: obj.ww[i-1]['ind']+ind+1;

                var obs_ind = lang1.join('').indexOf( chr );
                if ( obs_ind < 0 ) obs_ind = lang2.join('').indexOf( chr );
                console.log( chr ==="a")
                if ( isShow ) {
					obj.ww.push( { 'val': chr, 'ind': val } );
				} else {
					obj.ww.push( { 'val': chr, 'ind': (val) } );
					//str_arr[val]='<span class="ob nul" obs_ind="'+obs_ind+'">'+chr+'</span>';
				}
                str_arr[val]='<span class="ob nul" obs_ind="'+obs_ind+'">'+str_arr[val]+'</span>';

                i++;
				str=str.substr(ind+1);
				
			}
			else {
                return str_arr.join('');
            }
		}
	},
	
	/*----------- Проверяем на наличие переключенных оборотней ------------*/
	checkObsForHide: function(obj, lang) {
		var obs = obj.form.find('.outres .size span.ob'),
            t = 0, ob;
        obj.bin3=[];
		$.each( obj.ww, function(i, v){
			ob = obs.eq(i);
			if(lang.indexOf( v.val ) >-1 ) {
                console.log(v.val === 'a')
				ob.removeClass('nul').addClass('one').attr('v', ob.text());
				obj.bin3.push(1);
				t++;
			} else {
                ob.attr('v', ob.text());
				obj.bin3.push(0);
			}
		});
		return t;
	},
	/*---------- Финальная проверка -----------*/
	finCheck: function(obj) {
		var $bits = obj.form.find('.byteCount'), $obs = obj.form.find('.obCount');
		if(obj==hide) {
			if ($bits.text()=='0') {
				oborotni.redAlert($bits, 'Нечего прятать! Введите скрываемое сообщение.');	
					
				return;
			} else if(parseInt($obs.text())<parseInt($bits.text())) {
				oborotni.redAlert($obs, 'Количество оборотней в контейнере не может быть меньше количества скрываемых битов!');				
				return;
			} else {
				oborotni.obs.hi(obj);
				oborotni.transObs.hi(obj);

				oborotni.changeOb(obj);

				//obj.form.find('.output_field').text( obj.form.find('.outres .size').text().replace(/([^>])\n/g, '$1<br/>') ).trigger('change');

				obj.form.find('.but.act').each(function() {
					var cl = $(this).parents('tr').attr('class');
					if(cl == 'obor') {
						oborotni.obs.sh(obj);						
					} else if(cl=='trobor') {
						oborotni.transObs.hi(obj)
						oborotni.transObs.sh(obj);
					}
				});
				obj.form.find('.trObCount').html(oborotni.changeOb(obj))
				.parents('tr').qtip('api').set({
					'content.text': "Сообщение успешно спрятано!"
				}).show();
				setTimeout(function() {
					obj.form.find('.trObCount').parents('tr').qtip('api').hide().set({
						'content.text': "Отобразить биты, сокрытые в оборотнях."
					});
				}, '5000');
			}
		} else {
			if(parseInt($obs.text())<8){
				oborotni.redAlert($obs, 'В контейнере должно быть не меньше 8 оборотней!');
				return;
			} else if(parseInt(obj.form.find('.trObCount').text())<1) {
				oborotni.redAlert(obj.form.find('.trObCount'), 'В контейнере нет скрытых битов.');
				return;
			} else {
				$.post(
					'helper.php',
					{ 'data' : obj.bin3, 'task':'from' },
					function(data) {
                        obj.form.find('.input_field').text('').trigger('change');

						if(data && $.type(data)=='string' && data!='') {
                            obj.form.find('.input_field').text(data.toString()).trigger('change');

							obj.form.find('.binar').qtip('api').set({
								'content.text': "Сообщение успешно извлечено!"
							}).show();
							setTimeout(function() {
								obj.form.find('.binar').qtip('api').hide().set({
									'content.text': 'Отобразить битовое представление полученных символов.'
								});
							}, '5000');
						} else{
							oborotni.redAlert(obj.form.find('.trobor .but'), 'Извлеченная послндоватеьность битов не является допустимой. <br><br> Попробуйте переключить язык оборотней = 1.');
						}
					}, 
					'json'
				);
			}
		}
	},
	
	/*---------- Кодируем оборотней -----------*/
	changeOb: function(obj){
		var lang=obj.form.find('.lang').val(), lang1, lang2;
        console.log(lang)
		if(lang=='eng'){
			lang1=this.rus;
			lang2=this.eng;
		} else {
			lang1=this.eng;
			lang2=this.rus;
		}
		var t = 0, old, ob,
            obs= obj.form.find('.outres .size span.ob');
        $.each(obs, function(i, obo) {
            $(obo)
                .removeClass('one real').addClass('nul')
                .text( lang1[ $(obo).attr('obs_ind') ] );
        });
		$.each(obj.bin, function(i, v) {
			$.each(v, function(ind, val) {
				ob = obs.eq( ind + i * 8 );
				if (val==1) {
					ob.removeClass('nul').addClass('one')
                        .text(lang2[ob.attr('obs_ind')]);
				}
                else if(val==0) {
                    ob.addClass('real');
				}
                ob.attr('v', ob.text());
                t++;
			});
		});
        var txt = obj.form.find('.outres .size').html().replace(/([^>])\n/g, '$1<br/>').toString();
        console.log(txt)
		obj.form.find('.output_field').val( obj.form.find('.outres .size').text() );
		return t;	
	},
	
	/*---------- Переключаем подсказки -----------*/
	tips: {
		check: function($obj){
			var $tips = $obj.parents('.left').next('.tips');
			if($obj.val()=='') {
				oborotni.tips.change($tips, 'info');
				return false;
			} else {
				oborotni.tips.change($tips, 'full');
				return true;
			}
		},
		change: function($tips, cl) {
			var act=$tips.find('.tip.act');
			if (act.hasClass(cl)) {
				return;
			} else {
				act.removeClass('act');
				$tips.find('.'+cl).addClass('act');				
			} 
		}
	},
	
	/*---------- Проверяем size -----------*/
	checkSize: function(what, obj) {
		var $put=obj.form.find('.'+what+'put_field'), 
			 $res=obj.form.find('.'+what+'res');
		if($res.find('.size').height()>$put.height()) {
			$res.addClass('scroll-y');
			$put.addClass('scroll-y');
		} else {
			$res.removeClass('scroll-y');
			$put.removeClass('scroll-y');
		}
	},

	/*---------- Переключаем псевдо-textarea -----------*/
	inp_tog: function(what, dir, obj){
		var $put=obj.form.find('.'+what+'put_field'), 
			$res=obj.form.find('.'+what+'res');
		if (dir == 1) {
			$res.addClass('vis');
			$put.removeClass('vis');
		} else {
			$put.addClass('vis');
			$res.removeClass('vis');
		}
	},
	
	/*---------- Мигаем красным -----------*/
	redAlert: function(what, error, mous) {
		var qt = what.parents('tr').qtip('api')
		var old = qt.get('content.text');
		what.addClass('red');		
		qt.set({
			'content.text': error,
			'style.classes': 'ui-tooltip-red'
		}).show();
		setTimeout(function() {
			what.removeClass('red');
			if(!mous) qt.hide();
			qt.set({
				'content.text': old,
				'style.classes': 'ui-tooltip-green'
			});
		}, '5000');
	},
	
	/*---------- Переключаем байты -----------*/
	bytes: {
		sh: function(obj) {
			var elem = obj.form.find('.byteCount');
			if(elem.text()=='0') {
				oborotni.redAlert(elem);
			} else {
				oborotni.inp_tog('in', 1, obj);
				var a = obj==hide? 'введенных': 'извлеченных';
				obj.form.find('.binar .but')
					.addClass('act')
					.parents('tr').qtip('api').set({
						'content.text': 'Спрятать битовое представление '+a+' символов'
					});
			}
		},
		hi: function(obj) {
			oborotni.inp_tog('in', 0, obj);
			var a = obj==hide? 'введенных': 'извлеченных';
			obj.form.find('.binar .but')
				.removeClass('act')
				.parents('tr').qtip('api').set('content.text','Отобразить битовое представление '+a+' символов');
		}
	},
	
	/*---------- Переключаем оборотней -----------*/
	obs: {
		sh: function(obj) {
			var elem = obj.form.find('.obCount');
			if(elem.text()=='0') {
				oborotni.redAlert(elem, 'В контейнере нет оборотней!', true);			
			} else {
				obj.form.find('.ob').addClass('u');
				obj.form.find('.ob.one').addClass('b');
				oborotni.inp_tog('out', 1, obj)
				
				obj.form.find('.obor .but')
					.addClass('act')
					.parents('tr').qtip('api').set('content.text','Спрятать найденные оборотни');
			}
		},
		hi: function(obj) {
			obj.form.find('.ob').removeClass('u');
			obj.form.find('.ob.one').removeClass('b');
			if(!obj.form.find('.trobor .but').hasClass('act')) {
				oborotni.inp_tog('out', 0, obj)
			}
			$(this)
			obj.form.find('.obor .but')
				.removeClass('act')
				.parents('tr').qtip('api').set('content.text','Выделить найденные оборотни');
		}
	}, 
	
	/*---------- Переключаем закодированные оборотни -----------*/
	transObs: {
		sh: function(obj) {
			var elem = obj.form.find('.trObCount');
			if(elem.text()=='0') {
				oborotni.redAlert(elem, 'В контейнере нет оборотней, скрывающих биты!', true);
			} else {
				obj.form.find('.ob.one').text(1).addClass('b');
				obj.form.find('.ob.nul.real').text(0).addClass('b');
				oborotni.inp_tog('out', 1, obj)
				obj.form.find('.trobor .but')
					.addClass('act')
					.parents('tr').qtip('api').set('content.text','Спрятать биты, сокрытые в оборотнях');
			}
		}, 
		hi: function(obj) {
			$.each(obj.form.find('.outres .nul, .outres  .one'), function() {
				$(this).text($(this).attr('v'));
				$(this).removeClass('b');				
			});
			if(!obj.form.find('.obor .but').hasClass('act')) {
				oborotni.inp_tog('out', 0, obj)
			}
			obj.form.find('.trobor .but')
				.removeClass('act')
				.parents('tr').qtip('api').set('content.text','Отобразить биты, спрятанные в оборотнях');
		}
	}
	
};
	check_isob = function(lang, ch) {
		if(lang=='rus'){
			isob = oborotni.rus.join('').indexOf(ch);
			isob = isob>=0? isob: false;
		} else if(lang=='eng') {
			isob = oborotni.eng.join('').indexOf(ch);
			isob = isob>=0? isob: false;
		}
		return isob;
	}
    createTbl = function( lang, symbs ) {
    var $row, obor = false,
        $table = $('<table/>', { class:"asci_tbl"});

    $.each( symbs, function(ind, symb ) {
        $row = $('<tr/>');
        obor = check_isob(lang, symb.char);
        obor && $row.addClass('ob_ascii').attr('ind_ob', obor);
        $row.append(
            $('<td/>').text( symb.char===' '? 'пробел': symb.char ),
            $('<td/>').text( symb.bin )
        );
        $table.append( $row );
    });
    return $table;
}
	switchEvent = function() {
		if($('html').hasClass('ie8')){
			return 'keyup paste';
		} else {return 'input paste';}
	}
	checkInput = function (elem) {
		if (elem.attr('old')==elem.val()) {
			return false;
		} else {
			elem.attr('old', elem.val());
			return true;
		}
	}
$(function() {	
	hide.form=$('#to');
	show.form=$('#from');
	
	if (!$.browser.webkit) {
		
		$('INPUT[placeholder], TEXTAREA[placeholder]').blur(function(){ 
			
			if ($(this).val()=='') {
				$(this).val($(this).attr('placeholder'));
				$(this).addClass('m-placeholder');
			}
			
		}).focus(function(){
			
			$(this).removeClass('m-placeholder');
			if ($(this).val()==$(this).attr('placeholder'))
				$(this).val('');
			
		}).each(function(){
			
			if ( ($(this).val()=='') || ($(this).val()==$(this).attr('placeholder')) ) {
				$(this).val( $(this).attr('placeholder') );
				$(this).addClass('m-placeholder');
			}
			
			var form = $(this).closest('FORM');
			if (form.length)
				form.submit(function(){
					if ($(this).val()==$(this).attr('placeholder'))
						$(this).val('');
				});
			
		});
		
	}
	$.fn.qtip.defaults.style.classes = 'ui-tooltip-green ui-tooltip-shadow ui-tooltip-rounded';
	$.fn.qtip.defaults.position.my='right top';
    $.fn.qtip.defaults.position.at='left middle';
    $.fn.qtip.defaults.position.adjust.x=3;
	$.fn.qtip.defaults.show.delay=0;
	$.fn.qtip.defaults.hide.delay=0;
	

	if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}
	
/*--Вешаем обработчики событий------------------------------------*/
	$('.input_field').bind(switchEvent()+" change", function(e) {		//На маленький инпут	
		var elem = $(this);
		if( oborotni.tips.check(elem) && checkInput(elem)) {
			oborotni.getBin(oborotni.whatForm(elem));
		}				
	})
	$('.spaces').bind('change', function() {							//На чекбокс выключения пробелов
		oborotni.getBin(oborotni.whatForm($(this)))
	}).parents('tr').qtip({
		content: "Оставьте пустым, если хотите спрятать пробелы и переносы строк, вместе с остальными символами. <br><br> Учитывайте, что любой символ занимает 8 бит т.е. 8 оборотней."
	});
	$('.binar .but').click(function() {									//
		if($(this).hasClass('act')) {
			oborotni.bytes.hi(oborotni.whatForm($(this)));		
		} else {
			oborotni.bytes.sh(oborotni.whatForm($(this)));			
		}
	}).parents('tr').qtip({
		content: 'Отобразить битовое представление введенных символов.'
	});
	$('#from .binar .but').parents('tr').qtip({
		content: 'Отобразить битовое представление извлеченных символов.'
	});
	$('#to .lang').bind('change', function() {
		$('#to .output_field').trigger('change');
	}).parents('tr').qtip({
		content: function() {
			if($('#to .lang').val()=='eng'){
				return "<b>Английские оборотни</b><br> будут скрывать <b>бит =  1</b>. <br><br><b>Русские оборотни</b><br> будут скрывать <b>бит = 0</b>.";
			} else {
				return "<b>Русские оборотни</b><br> будут скрывать <b>бит = 1</b>. <br><br><b>Английские оборотни</b><br> будут скрывать <b>бит = 0</b>.";
			} 
		}
	});
	$('#from .lang').bind('change', function() {
		$('#from .output_field').trigger('change');
	}).parents('tr').qtip({
		content: function() {
			if($('#from .lang').val()=='eng'){
				return "<b>Английские оборотни</b><br> будут преобразованы в <b>бит = 1</b>. <br><br><b>Русские оборотни</b><br> будут преобразованы в <b>бит = 0</b>.";
			} else {
				return "<b>Русские оборотни</b><br> будут преобразованы в <b>бит = 1</b>. <br><br><b>Английские оборотни</b><br> будут преобразованы в <b>бит = 0</b>.";
			} 
		}
	});
	$('.output_field').bind(switchEvent()+' change', function(e) {	
		var stop = false;
		if((e.keyCode == 67 && e.ctrlKey )|| e.ctrlKey) {
			stop =true;
		}
		if(!stop && oborotni.tips.check($(this))) {
			var elem = $(this);
			var obj = oborotni.whatForm(elem);	
			var lang=obj.form.find('.lang').val()=='eng'? oborotni.eng: oborotni.rus;
			//if(obj.str!==elem.val()) {			
				obj.str=elem.val();
				obj.ww=[];
				obj.form.find('.outres .size').html(oborotni.findOb(obj).replace(/([^>])\n/g, '$1<br/>'));
				obj.form.find('.obCount').text(obj.ww.length);
				if(obj==show) {
					obj.form.find('.trObCount').html(oborotni.checkObsForHide(obj, lang));
				}			
				oborotni.checkSize('out', obj);
			//}
		}
	}).focus(function() {
		oborotni.obs.hi(oborotni.whatForm($(this)));
		oborotni.transObs.hi(oborotni.whatForm($(this)));
	}).bind("paste", function() {
		var obj = oborotni.whatForm($(this));
		setTimeout(function(){
			obj.form.find('.output_field').trigger('change');
		}, 10)
	});
	$('.outres').click(function() {
		oborotni.obs.hi(oborotni.whatForm($(this)));
		oborotni.transObs.hi(oborotni.whatForm($(this)));
        $('.output_field').focus()
	});
	$('.obor .but').click(function() {
		if($(this).hasClass('act')) {
			oborotni.obs.hi(oborotni.whatForm($(this)));			
		} else {
			oborotni.obs.sh(oborotni.whatForm($(this)));			
		}
	}).parents('tr').qtip({
		content: 'Выделить найденные оборотни.'
	});
	$('.trobor .but').click(function() {
		if($(this).hasClass('act')) {
			oborotni.transObs.hi(oborotni.whatForm($(this)));
		} else {
			oborotni.transObs.sh(oborotni.whatForm($(this)));
		}
	}).parents('tr').qtip({
		content: 'Отобразить биты, спрятанные в оборотнях.'
	});
	
	$('.test').bind('click', function(){
		oborotni.finCheck(oborotni.whatForm($(this)))
	});
	
	$('#formTabs').delegate('.tab', 'click', function() {
		if(!$(this).hasClass('act')){
			if($(this).attr('id')=='hideform') {
				show.form.hide();
				hide.form.show();				
			} else {
				hide.form.hide();
				show.form.show();
				
			}
			$('#formTabs .tab.act').toggleClass('act');
			$(this).toggleClass('act');
			
		}
	});
	$('#tipTabs').delegate('.tab', 'click', function() {
		if(!$(this).hasClass('act')) {
			if($(this).attr('id')=='inform'){
				$('#ascii_form').hide();
                $('#ascii_info').hide();
                $('#obs_info').hide();
				$('#information').show();
			}
            else if($(this).attr('id')=='ascii') {
				$('.asci_tbl tr:not(.ob_ascii)').css('display', 'table-row');
				$('#ascii_form').show();
                $('#ascii_info').show();
                $('#obs_info').hide();
				$('#information').hide();
			}
            else {
				$('.asci_tbl tr:not(.ob_ascii)').css('display', 'none');
				$('#ascii_form').show();
                $('#obs_info').show();
                $('#ascii_info').hide();
				$('#information').hide();
			}
			$('#tipTabs .tab.act').toggleClass('act');
			$(this).toggleClass('act');
		}
	});

	$.get( 'helper.php', { 'task':'getAsci' },
		function( data ) { // { rus, eng, other, digs }
            var tables = [];
			$.each(data, function(j, v) {
                if ( v.big ) {
                    tables.push( $('<div class="tbl_wrap">').append(
                        createTbl( j, v.big ),
                        createTbl( j, v.sm )
                    )[0] );
				} else {
                    tables.push( $('<div class="tbl_wrap">').append(
                        createTbl( j, v )
                    )[0] );
				}
			});
            $('#ascii_form').append(
                $('<dl/>', { id:'ascii_info'} ).append(
                    $('<p/>', { class: 'dt' }).text('ASCII'),
                    $('<p/>', { class: 'dd' }).text('— представляет собой кодировку для представления десятичных цифр, латинского и национального алфавитов, знаков препинания и управляющих символов.')
                ),
                $('<dl/>', { id:'obs_info'} ).append(
                    $('<p/>', { class: 'dt' }).text('Оборотни'),
                    $('<p/>', { class: 'dd' }).text('— символы, внешне не отличимые человеком, но представленные различными значениями в кодировке ASCII.')
                ),
                tables
            ).append( tables );
		},
		'json'
	);
    var last = 0;
    $('#generator').click(function rand() {
        var cur = Math.round(Math.random()*4 );
        if ( last == cur ) rand();
        last = cur;
        $('#to .output_field').text( texts[ last ]).trigger('change')
    })
});