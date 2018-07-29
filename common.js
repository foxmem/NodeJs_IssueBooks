$.ajaxSetup({
  cache: false,
  /*  dataType: 'json',
    contentType: "application/json; charset=utf-8"*/
});

if (typeof moment !== 'undefined') {
  moment.locale('zh-CN');
}

/** LayUi 后台模板，左侧菜单主菜单中使用 根据url加载页面到当前模板中的iframe去加载页面。 */
const reload = (id, url) => {
  if (url.substring(0, 1) === '/') {
    $(id).attr("src", url);
  }
  $(id).attr("src", APP.api + url);
};

/** LayUI 后台模板，左侧的菜单，主菜单项 一个菜单项（含其子菜单） */
const menu_item = (id, fid, arr) => {
  let li = $("<li class='layui-nav-item'></li>");
  if (arr.length > 1) {
    li.append($("<a href='javascript:;'>" + arr[0].title + "</a>"));
    let dl = $("<dl class='layui-nav-child'></dl>");
    for (let i = 1; i < arr.length; i++) {
      dl.append($("<dd></dd>").append("<a href='javascript:reload(\"" + fid + "\",\"" + arr[i].url + "\");'>" + arr[i].title + "</a>"));
    }
    li.append(dl);
  } else {
    li.append($("<a href='javascript:reload(\"" + fid + "\",\"" + arr[0].url + "\");'>" + arr[0].title + "</a>"));
  }
  $(id).append(li);
};

/** location加载页面 */
const urlload = url => {
  location.href = url;
};

/**
 * 初始化百度的UmEditor富文本编辑器
 *
 * //这里是必须导入的文件，注意：editor_api.js 中的src路径的问题，需要修改成你的路径，否则编辑器渲染不出来！
 * <link href="/common/umeditor/themes/default/_css/umeditor.css" type="text/css" rel="stylesheet">
 * <script type="text/javascript" src="/common/jquery-3.2.1.min.js"></script>
 * <script type="text/javascript" charset="utf-8" src="/common/umeditor/umeditor.config.js"></script>
 * <script type="text/javascript" charset="utf-8" src="/common/umeditor/_examples/editor_api.js"></script>
 * <script type="text/javascript" src="/common/umeditor/lang/zh-cn/zh-cn.js"></script>
 *
 * //这里是设置编辑器的宽高
 * <style> #myEditor {width:800px;height:240px;}</style>
 *
 * //这里是需要渲染的编辑器
 * <script type="text/plain" id="myEditor"></script>
 *
 */
const initUmEditor = id => {
  const URL = APP.preffix;
  let option = {
    
    fontfamily: [
      {name: '宋体', val: '宋体'},
      {name: '微软雅黑', val: '微软雅黑'},
      {name: '黑体', val: '黑体'},
      {name: '幼圆', val: '幼圆'}
    ],
    fontsize: [12, 16, 18, 24, 32, 48],//经过测试，这些数据是足够使用的
    toolbar: [
      'source | undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor | removeformat |',
      'insertorderedlist insertunorderedlist | selectall cleardoc | fontfamily fontsize',
      '| justifyleft justifycenter justifyright justifyjustify |',
      'link unlink | emotion image video  | map',
      '| horizontal print preview fullscreen', 'drafts', 'formula'
    ],
    filterRules: function () {
      return {
        span: function (node) {
          if (/Wingdings|Symbol/.test(node.getStyle('font-family'))) {
            return true;
          } else {
            node.parentNode.removeChild(node, true)
          }
        },
        p: function (node) {
          var listTag;
          if (node.getAttr('class') == 'MsoListParagraph') {
            listTag = 'MsoListParagraph'
          }
          node.setAttr();
          if (listTag) {
            node.setAttr('class', 'MsoListParagraph')
          }
          if (!node.firstChild()) {
            node.innerHTML(UM.browser.ie ? '&nbsp;' : '<br>')
          }
        },
        div: function (node) {
          var tmpNode, p = UM.uNode.createElement('p');
          while (tmpNode = node.firstChild()) {
            if (tmpNode.type == 'text' || !UM.dom.dtd.$block[tmpNode.tagName]) {
              p.appendChild(tmpNode);
            } else {
              if (p.firstChild()) {
                node.parentNode.insertBefore(p, node);
                p = UM.uNode.createElement('p');
              } else {
                node.parentNode.insertBefore(tmpNode, node);
              }
            }
          }
          if (p.firstChild()) {
            node.parentNode.insertBefore(p, node);
          }
          node.parentNode.removeChild(node);
        },
        //$:{}表示不保留任何属性
        br: {$: {}},
        //                a: function (node) {
        //                    if(!node.firstChild()){
        //                        node.parentNode.removeChild(node);
        //                        return;
        //                    }
        //                    node.setAttr();
        //                    node.setAttr('href', '#')
        //                },
        //                strong: {$: {}},
        //                b:function(node){
        //                    node.tagName = 'strong'
        //                },
        //                i:function(node){
        //                    node.tagName = 'em'
        //                },
        //                em: {$: {}},
        //                img: function (node) {
        //                    var src = node.getAttr('src');
        //                    node.setAttr();
        //                    node.setAttr({'src':src})
        //                },
        ol: {$: {}},
        ul: {$: {}},
        
        dl: function (node) {
          node.tagName = 'ul';
          node.setAttr()
        },
        dt: function (node) {
          node.tagName = 'li';
          node.setAttr()
        },
        dd: function (node) {
          node.tagName = 'li';
          node.setAttr()
        },
        li: function (node) {
          
          var className = node.getAttr('class');
          if (!className || !/list\-/.test(className)) {
            node.setAttr()
          }
          var tmpNodes = node.getNodesByTagName('ol ul');
          UM.utils.each(tmpNodes, function (n) {
            node.parentNode.insertAfter(n, node);
            
          })
          
        },
        table: function (node) {
          UM.utils.each(node.getNodesByTagName('table'), function (t) {
            UM.utils.each(t.getNodesByTagName('tr'), function (tr) {
              var p = UM.uNode.createElement('p'), child, html = [];
              while (child = tr.firstChild()) {
                html.push(child.innerHTML());
                tr.removeChild(child);
              }
              p.innerHTML(html.join('&nbsp;&nbsp;'));
              t.parentNode.insertBefore(p, t);
            })
            t.parentNode.removeChild(t)
          });
          var val = node.getAttr('width');
          node.setAttr();
          if (val) {
            node.setAttr('width', val);
          }
        },
        tbody: {$: {}},
        caption: {$: {}},
        th: {$: {}},
        td: {$: {valign: 1, align: 1, rowspan: 1, colspan: 1, width: 1, height: 1}},
        tr: {$: {}},
        h3: {$: {}},
        h2: {$: {}},
        //黑名单，以下标签及其子节点都会被过滤掉
        '-': 'script style meta iframe embed object'
      }
    }()
    //图片上传配置区
    ,imageUrl:URL+"file/imageUp"             //图片上传提交地址
    ,imagePath:URL + "file/"                     //图片修正地址，引用了fixedImagePath,如有特殊需求，可自行配置
    ,imageFieldName:"upfile"                   //图片数据的key,若此处修改，需要在后台对应文件修改对应参数
  };
  UM.MyOption = option;//为了实现扩展封装，我们将配置参数放到此处
  return UM.getEditor(id, option);
};

const MSG = msg => {
  console.log(msg);
};

const log = msg => {
  console.log(msg);
};

const APP = {
  api: '/',
  //preffix: window.location.hostname + ':' + parseInt(window.location.port) + '/',
  preffix:'http://127.0.0.1:8083/',
  getUserInfo: ()=>{
    localforage.getItem('ME', function (err, value) {
      if (err) {
        console.error(`LocalForage has no user's info Find!`);
      } else {
        $("#home_user").html(value.name);
      }
    });
  }
};
APP.Act = {
  /**
   * Get Ajax Request
   * @param map : {k,v}
   * @param path : "xxx/xxx/......"
   * @param callback : function(d)
   */
  delete: function (map, path, callback) {
    //询问框
    layer.confirm('删除？', {
      btn: ['删除', '取消'] //按钮
    }, function () {
      $.ajax({
        url: APP.preffix + path,
        type: 'POST',
        data: JSON.stringify(map),
        success: function (data) {
          callback(JSON.parse(data));
        },
        error: function () {
        }
      });
    }, function () {
    });
  },
  /**
   * 新增和条件查询
   * Post Ajax Request
   * @param json : {k,v}
   * @param path : "xxx/xxx/......"
   * @param callback : function(d)
   */
  post: function (json, path, callback) {
    $.ajax({
      url: APP.preffix + path,
      type: 'POST',
      data: JSON.stringify(json),
      success: function (data) {
        callback(JSON.parse(data));
      },
      error: function () {
      }
    });
  }
};

//临时存放的没有用到的代码方案
const temp = {
  tab: null,
  //提供组对象，提供其中被选中时标记class名称,提供连带组的选中的class名称
  //实现连带的切换
  changeSelect: function (who, clas, classs) {
    who.click(function () {
      who.siblings("." + clas).removeClass(clas);
      who.addClass(clas);
      let arr = who.parent().children();
      for (let i = 0; i < arr.length; i++) {
        if (arr.eq(i).hasClass(clas)) {
          //MSG("get this index = "+i);
          who.parent().next().find("." + classs).removeClass(classs);
          who.parent().next().children().eq(parseInt(i)).addClass(classs);
        }
      }
    });
  },
  //将tab标签的绑定切换
  tabClick: function () {
    let me = this.tab;
    let num = me.find("li").each(function () {
      temp.changeSelect($(this), 'layui-this', 'layui-show');
    });
  },
};

const File = {
  upload: function (file, callback, customName) {
    console.log('上传文件', file);
    
    /**
     * FormData ,k-v 模拟表单,实现异步二进制文件上传
     * https://developer.mozilla.org/zh-CN/docs/Web/API/FormData
     */
    let formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    if (customName) {
      formData.append("customName", customName);
    } else {
      formData.append("customName", "");
    }
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", APP.api + 'file/upload');
    xhr.onreadystatechange = function (e) {
      if (this.readyState === 4 && this.status === 200) {
        let uuidName = this.responseText;
        console.log('文件uuidName', uuidName);
        callback(uuidName, file);
      }
    };
    xhr.send(formData);
  },
  getUri: function (uuidName, name) {
    // let uri = APP.api + 'file/' + uuidName;
    let uri = APP.api + 'file/download?uuidName=' + uuidName + "&date=" + new Date().getTime();
    if (name) {
      uri += '/' + name;
    }
    return uri;
  },
  getFullUri:function (uuidName) {
    return APP.preffix+uuidName;
  },
  download: function (uri) {
    urlload(uri);
  }
};
