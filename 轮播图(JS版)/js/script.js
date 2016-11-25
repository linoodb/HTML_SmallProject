var SLIDE = 1224; //大图片滑动的距离
var SLIDE_TIME = 60; //大图片切换时间
var PROCESS_TIME = 180; //进度条时间
var MAX_PROCESS = 204; //最大进度条长度
var INDEX = 0; //当前大图片的下标
var MAX_IMAGE = 6; //总图片数
var isSlide = false; //大图片是否切换，切换中进度条不移动

//大图片容器
var bImg = document.getElementById('b-img');
//小图片容器
var sImg = document.getElementById('s-img');
//注册到点击事件到ul容器
sImg.addEventListener('click', onClickFunc, false);

//进度条事件
var processID = requestAnimationFrame(processFunc);
function processFunc() {
	//大图片正在切换，进度条不动
	if(isSlide) return;

	//当前图片的进度条
	var curProcess = sImg.getElementsByClassName('progressing')[INDEX];
	//原始位置
	var startPos = parseFloat(getStyle(curProcess).width);
	//百分比，分成100份
	var percent = MAX_PROCESS / PROCESS_TIME;
	if(startPos + percent < MAX_PROCESS) {
		curProcess.style.width = startPos + percent + 'px';
	}else{
		//进度满了恢复为0
		curProcess.style.width = '0px';
		//自动循环播放下一个图片
		INDEX = INDEX + 1 < MAX_IMAGE ? INDEX + 1 : 0;
		slideAnimatin();
	}
	requestAnimationFrame(processFunc);
}

//点击小图片切换大图片
function onClickFunc(event) {
	//点击自身，直接返回，否则清除所有进度条
	if(Number(event.target.dataset.index) === INDEX){
		return;
	}else{
		var sImages = sImg.getElementsByClassName('progressing');
		Array.prototype.forEach.call(sImages, function(item,index,array){
			item.style.width = '0px';
		});
	}
	//点击小图片对应的下标
	INDEX = Number(event.target.dataset.index);
	cancelAnimationFrame(processID);
	slideAnimatin();
	event.stopPropagation();
}

//切换大图片动画
function slideAnimatin(){
	//原始位置
	var startPos = parseFloat(getStyle(bImg).left);
	//目标位置
	var endPos = - INDEX * SLIDE;
	//移动方向
	var dir = startPos > endPos ? -1 : 1;
	//百分比，分成100份
	var percent = Math.abs(endPos - startPos) / SLIDE_TIME;
	var slideImage = function() {
		var pos = parseInt(getStyle(bImg).left);
		//往右移
		if(dir > 0){
			if(pos + percent * dir < endPos){
				bImg.style.left = pos + percent * dir + 'px';
				requestAnimationFrame(slideImage);
				isSlide = true;
			}else{
				bImg.style.left = endPos + 'px';
				isSlide = false;
				processID = requestAnimationFrame(processFunc);
				return;
			}
		}else{ //往左移
			if(pos + percent * dir > endPos){
				bImg.style.left = pos + percent * dir + 'px';
				requestAnimationFrame(slideImage);
				isSlide = true;
			}else{
				bImg.style.left = endPos + 'px';
				isSlide = false;
				processID = requestAnimationFrame(processFunc);
				return;
			}
		}
	}
	requestAnimationFrame(slideImage);
}

//获取样式
function getStyle(ele){
	return window.getComputedStyle(ele);
}


