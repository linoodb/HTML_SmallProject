var TRACK_URL = 'track.json'; //歌曲列表的路径
var m_json = []; //用于维护所有歌曲信息
var first_selected = -1; //开始点击的位置
var last_selected = -1; //最后点击的位置
var totalSelected = 0; //总选择数
var i_index = -1; //当前编辑的元素下标
var t_wrap = document.getElementById('t-wrap'); //包裹层
var toggle_love = document.getElementById('toggle-love'); //全选爱心开关
var t_list = getElementsByClassName(t_wrap, 't-list')[0]; //歌曲列表
var m_wrap = document.getElementById('m-wrap'); //菜单栏

//先通过AJAX获取歌曲列表，返回结果后开始初始化
// getTrack(init);
//本地读取JS，测试使用
init(SOUND_LIST);

//初始化
function init(trackJSON){
    m_json = trackJSON;
	//初始化歌曲列表信息，并保存到m_json用于后期维护数据
	for(var i = 0, length = trackJSON.length; i < length; i ++){
        m_json[i].isSelected = false;
        m_json[i].isLove = false;
        t_list.appendChild(createItem(i));
	}

	//初始化事件
    initEvent();

    //渲染
    render();
}

//初始化事件
function initEvent(){
    //全选爱心事件
    addToggleLove();

    //列表项事件
    addClickSelect();

    //禁止弹出默认菜单事件
    removeContextMenu();

    //自定义菜单事件
    addContextMenu();

    //编辑歌曲名称事件
    addEditName();
}

//创建列表项
function createItem(index){
	var li = createLi(index);
    li.appendChild(createOrder()); //序号
    li.appendChild(createLove()); //爱心
    li.appendChild(createName()); //歌曲名称
    li.appendChild(createArtist()); //歌手
    li.appendChild(createAlbum()); //专辑名
    li.appendChild(createTime()); //歌曲时间
    return li;
}

//创建li
function createLi(index){
    var li = document.createElement('li');
    var mClass = (index % 2) ? 'even-line' : 'odd-line'; //单数还是双数项
    addClass(li, mClass);
    addClass(li, 'index-' + index); //保存索引值用于查找列表项
    return li;
}
//创建序号
function createOrder(){
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'i-number');
    return span;
}
//创建爱心
function createLove(){
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'love');
    addClass(span, 'off-love');
    return span;
}
//创建歌曲名称
function createName(){
    var a = document.createElement('a');
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'i-name');
    span.appendChild(a);
    return span;
}
//创建歌手名称
function createArtist(){
    var a = document.createElement('a');
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'i-singer');
    span.appendChild(a);
    return span;
}
//创建专辑名称
function createAlbum(){
    var a = document.createElement('a');
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'i-album');
    span.appendChild(a);
    return span;
}
//创建歌曲时间
function createTime(){
    var span = document.createElement('span');
    addClass(span, 't-item');
    addClass(span, 'i-time');
    return span;
}

//添加全选爱心事件
function addToggleLove(){
    addEvent(toggle_love, 'mousedown', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement; //兼容IE
        if(event.button === 0){ //左键
            if(hasClass(target, 'off-love')){
                replaceClass(target, 'on-love', 'off-love');
                toggleLove(true);
            }else{
                replaceClass(target, 'off-love', 'on-love');
                toggleLove(false);
            }
        }
        render();
    });
}
//切换全选爱心开关
function toggleLove(bool){
    m_json.forEach(function(item, index, array){
        item.isLove = bool;
    })
}

//添加单击选中列表项事件
function addClickSelect(){
    addEvent(t_list, 'mousedown', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement; //兼容IE
        var index = null;
        //首先判断是否点击在ul标签
        if(!hasClass(target, 't-list')){
            if(hasClass(target, 'odd-line') || hasClass(target, 'even-line')){
                //点击在li标签，直接去索引
                index = getIndex(target);
            }else if(hasClass(target, 't-item')){
                //点击在span标签
                index = getIndex(target.parentNode);
            }else{
                //点击在a标签，不作处理
            }
        }
        if(index == null) return;
        if(event.button === 0){ //左键
            //隐藏菜单栏
            hideContextMenu();
            //终止编辑
            if(i_index !== -1){
                if(i_index !== index){
                    endEdit();
                    i_index = -1;
                }
            }
            //按着Ctrl一首一首的可以多选
            if(event.ctrlKey){
                //记录位置供多选使用
                if(first_selected === -1){
                    first_selected = index;
                }else if(last_selected === -1){
                    last_selected = index;
                }else{
                    first_selected = index;
                    last_selected = index;
                }
                if(!hasClass(target, 'love')){
                    m_json[index].isSelected = !m_json[index].isSelected;
                }
            }else if(event.shiftKey){
                //按着shift可以连着一大段多选
                if(!hasClass(target, 'love')){
                    //多选前先清除所有选中
                    clearSelected();
                    var range = getRangeOfSelection(index);
                    selectRange(range[0], range[1]);
                }
            }else{
                //是否点击爱心
                if(hasClass(target, 'love')){
                    hasClass(target, 'off-love') ? m_json[index].isLove = true : m_json[index].isLove = false;
                }else{
                    //记录位置供多选使用
                    if(first_selected === -1){
                        first_selected = index;
                    }else if(last_selected === -1){
                        last_selected = index;
                    }else{
                        first_selected = index;
                        last_selected = index;
                    }
                    //单选前先清除所有选中
                    clearSelected();
                    m_json[index].isSelected = true;
                }
            }
        }else if(event.button === 2){ //右键
            //记录位置供多选使用
            if(first_selected === -1){
                first_selected = index;
            }else if(last_selected === -1){
                last_selected = index;
            }else{
                first_selected = index;
                last_selected = index;
            }
            //设置坐标
            m_wrap.style.left = event.clientX + 'px';
            m_wrap.style.top = event.clientY + 'px';
            //判断选择的状态
            if(totalSelected === 0){
                //一开始直接点右键，选中
                m_json[index].isSelected = true;
                showContextMenu(true);
            }else if(totalSelected === 1){
                //右键单选切换，和左键单选一样
                clearSelected();
                m_json[index].isSelected = true;
                showContextMenu(true);
            }else{
                //多选后右键选择到多个选项以外，删除所有多选变为单选
                if(m_json[index].isSelected === false){
                    clearSelected();
                    m_json[index].isSelected = true;
                    showContextMenu(true);
                }else{
                    showContextMenu(false);
                }
            }
        }
        render();
    });
}

//禁止默认右键菜单事件
function removeContextMenu(){
    addEvent(document, 'contextmenu', function(event){
        event = event || window.event;
        if(event.preventDefault){
            event.preventDefault();
        }else{ // 兼容低版本浏览器
            event.returnValue = false;
        }
    });
}

//自定义右键菜单事件
function addContextMenu(){
    addEvent(m_wrap, 'mousedown', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement; //兼容IE
        switch (target.textContent) {
            case '删除歌曲':
                deleteSound();
                break;
            case '插入歌曲':
                insertSound();
                break;
            case '编辑歌曲':
                editSound();
                break;
            default:
                throw new Error('菜单栏点击出错');
                break;
        }
        //更新数据
        upDate();
        //操作后，隐藏菜单栏
        addClass(m_wrap, 'm-hidden');
        //渲染
        render();
    });
}

//编辑歌曲事件
function addEditName(){
    addEvent(t_list, 'keydown', function(event){
        event = event || window.event;
        var target = event.target || event.srcElement; //兼容IE
        //提交内容
        if(event.keyCode == 13){ //点击Enter键
            //终止编辑
            endEdit();
            i_index = -1;
            event.preventDefault();
        }
    });
}

//渲染列表
function render(){

    //重置选项计数
    totalSelected = 0;

    m_json.forEach(function(item, index, array){
        var li = t_list.childNodes[index];
        //渲染列表项
        if(item.isSelected){
            totalSelected += 1;
            addClass(li, 't-selected');
        }else{
            removeClass(li, 't-selected');
        }
        //渲染序号
        var id_span = li.childNodes[0];
        id_span.textContent = (index + 1) < 10 ? '0' + (index + 1) : (index + 1);
        //渲染爱心
        var love_span = li.childNodes[1];
        item.isLove ? replaceClass(love_span, 'on-love', 'off-love') : replaceClass(love_span, 'off-love', 'on-love');
        //渲染歌曲名称
        var name_span = li.childNodes[2];
        name_span.childNodes[0].href = item.mp3Url;
        name_span.childNodes[0].textContent = item.name;
        //渲染歌手名称
        var artist_span = li.childNodes[3];
        artist_span.childNodes[0].href = item.artist.id;
        artist_span.childNodes[0].textContent = item.artist.name;
        //渲染专辑名
        var album_span = li.childNodes[4];
        album_span.childNodes[0].href = item.album.id;
        album_span.childNodes[0].textContent = item.album.name;
        //渲染歌曲时间
        var duration_span = li.childNodes[5];
        duration_span.textContent = getTime(item.duration);
    });
}

//根据节点，获取点击的序号
function getIndex(node){
    var index;
    var target;
    //首先判断是否点击在ul标签
    if(!hasClass(node, 't-list')){
        if(hasClass(node, 'odd-line') || hasClass(node, 'even-line')){
            //点击在li标签
            target = node;
        }else if(hasClass(node, 't-item')){
            //点击在span标签，该span为非爱心标签
            if(!hasClass(node, 'love')){
                target = node.parentNode;
            }
        }else{
            //点击在a标签，不作处理
        }
    }
    //匹配index-xxx规则，然后根据'-'切割
    var mClass = target.className.match(/index-\d+/)[0];
    return Number(mClass.split("-")[1]);
}

//获取选择范围，返回数组的两个值代表选中的范围
function getRangeOfSelection(index){
    if(first_selected === -1){
        first_selected = index;
        return [index, index];
    }else if(last_selected === -1){
        last_selected = index;
        if(first_selected <= last_selected){
            return [first_selected, last_selected];
        }else{
            return [last_selected, first_selected];
        }
    }else{
        if(first_selected > index && last_selected > index){
            //逆序点击，切换方向
            last_selected = index;
            return [index, first_selected];
        }else if(first_selected < index && last_selected < index){
            //顺序点击，添加更多
            last_selected = index;
            return [first_selected, index];
        }else{
            //点击在上一次选择范围内
            if(first_selected <= index){
                last_selected = index;
                return [first_selected, index];
            }else{
                last_selected = index;
                return [index, first_selected];
            }
        }
    }
}

//选择范围内的选项
function selectRange(start, end){
    for(var i = start; i <= end; i ++){
        m_json[i].isSelected = true;
    }
}

//清除所有选项
function clearSelected(){
    m_json.forEach(function(item, index, array){
        item.isSelected = false
    });
}

//显示菜单栏
function showContextMenu(bool){
    var itemList = m_wrap.getElementsByTagName('li');
    //单选，可以删除、插入、编辑
    if(bool){
        Array.prototype.forEach.call(itemList, function(item, index, array){
            if(hasClass(item, 'm-hidden')){
                removeClass(item, 'm-hidden');
            }
        });
    }else{ //多选，只能删除
        addClass(itemList[1], 'm-hidden');
        addClass(itemList[2], 'm-hidden');
    }
    //移除包裹层隐藏类，显示菜单栏
    removeClass(m_wrap, 'm-hidden');
}

//隐藏菜单栏
function hideContextMenu(){
    if(!hasClass(m_wrap, 'm-hidden')){
        addClass(m_wrap, 'm-hidden');
    }
}

//删除选中歌曲
function deleteSound(){
    for(var i = m_json.length - 1; i >= 0; i --){
        if(m_json[i].isSelected === true){
            t_list.removeChild(t_list.childNodes[i]);
            m_json.splice(i, 1);
        }
    }
}

//插入单个歌曲
function insertSound(){
    var index, data;
    for(var i = m_json.length - 1; i >= 0; i --){
        if(m_json[i].isSelected === true){
            //往前插入
            index = (i - 1) < 0 ? 0 : i;
            t_list.insertBefore(createItem(index), t_list.childNodes[i]);
            m_json.splice(index, 0, createMySound());
            break;
        }
    }
}

//编辑单个歌曲
function editSound(){
    for(var i = m_json.length - 1; i >= 0; i --){
        if(m_json[i].isSelected === true){
            //编辑歌曲名字
            i_index = i;
            startEdit();
            break;
        }
    }
}

//更新数据
function upDate(){
    var li;
    for(var i = 0, length = m_json.length; i < length; i ++){
        li = t_list.childNodes[i];
        //更新保存索引的类名
        removeClass(li, 'index-\\d+');
        addClass(li, 'index-' + i);
        //更新单双行类名
        if(hasClass(li, 'odd-line')){
            removeClass(li, 'odd-line');
        }else if(hasClass(li, 'even-line')){
            removeClass(li, 'even-line')
        }
        var mClass = (i % 2) ? 'even-line' : 'odd-line';
        addClass(li, mClass);
    }
}

//插入新的歌，使用自定义歌曲来代替
function createMySound(){
    var noodb = {
        'id': 99999999,
        'name': '我是插入的歌啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
        'duration': 188888,
        'mp3Url': 'https://github.com/linoodb',
        'album': {
            'id': 8888888,
            'name': 'https://github.com/linoodb'
        },
        'artist': {
            'id': 123456,
            'name': 'noodb'
        }
    }
    noodb.isSelected = false;
    noodb.isLove = false;
    return noodb
}

//开始编辑
function startEdit(){
    var li = t_list.getElementsByTagName('li')[i_index];
    var span = li.getElementsByTagName('span')[2];
    span.contentEditable = true;
    addClass(span, 'i-input');
}

//结束编辑
function endEdit(){
    var li = t_list.getElementsByTagName('li')[i_index];
    var span = li.getElementsByTagName('span')[2];
    span.contentEditable = false;
    removeClass(span, 'i-input');
    //同步数据
    m_json[i_index].name = span.textContent;
    span.textContent = m_json[i_index].name;
    console.log(m_json[i_index].name)
}

//时间戳转换为时间
function getTime(time){
	time = time / 1000;
	var m = Math.floor(time / 60);
    var s = Math.floor(time % 60);
    return ( m < 10 ? '0' : '' ) + m + ':' + ( s < 10 ? '0' : '' ) + s;
}
