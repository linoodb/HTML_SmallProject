//创建自定义下拉列表数据
function createData(deep, total, prefix){
	var data = [];
	if(total === 0) return data;
	for(var i = 0; i < deep; i ++){
		var content = prefix + (i + 1);
		for(var j = 1; j < total; j ++){
			content += ".0";
		}
		var obj = {};
		obj.text = content;
		obj.value = (i + 1).toString();
		obj.list = createData(deep, total - 1, prefix + (i + 1) + ".");
		data.push(obj);
	}
	return data;
}

//创建级联的下拉列表，返回下拉列表数组
//传入表格，需要添加的select数量，option的描述
function createSelect(form, total, des){
	var selectList = [];
	var select;
	var option;
	for(var i = 0; i < total; i ++){
		select = document.createElement('select');
		option = document.createElement('option');
		option.value = '0';
		option.textContent = des;
		form.appendChild(select);
		select.appendChild(option);
		selectList.push(select);
	}

	return selectList;
}

//支持任意级选择器级联的下拉列表
function cascade(selectList, data){
	//每次推出最前一个下拉列表，递归直到没有下拉列表则返回
	if(selectList.length === 0) return;
	var newList = selectList.slice();
	var select = newList.shift();
	//先清除所有列表，再重新填充
	clearSelect(selectList);
	fillSelect(select, data);
	//默认选中第二栏
	select.value = "1";
	select.addEventListener('change', function(event){
		var index = event.target.value;
		//选择了第一栏[请选择]，清空所有下级列表并返回
		if(index === "0"){
			clearSelect(newList);
			return
		}
		cascade(newList, data[index-1].list);
	});
	//所有下级列表默认选中第二栏
	cascade(newList, data[0].list);
}

//填充下拉列表
function fillSelect(select, list){
    list.forEach(function(item, index, array){
        var option = new Option(item.text, item.value);
        select.add(option);
    });
}
//清空下拉列表
function clearSelect(selectList){
	for(var i = 0, length = selectList.length; i < length; i++){
		//保留第一栏[请选择]不清除
	    for(var j = selectList[i].length - 1; j > 0; j--){
	    	selectList[i].remove(j);
	    }
	}
}

//下拉列表的深度
var deep = 5;
//下拉列表的数量
var total = 4;
//创建表单
var form = document.createElement('form');
form.name = 'myForm';
//添加到body
var body = document.getElementsByTagName('body')[0];
body.insertBefore(form, body.firstElementChild);
//创建级联下拉列表数据
var myData = createData(deep, total, "");
//创建级联下拉列表，并且获取所有下拉列表的数组
var selectList = createSelect(form, total, "请选择");
//填充
cascade(selectList, myData);
