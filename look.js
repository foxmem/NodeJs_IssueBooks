let common = {
  tips: {
    show: function (tit, view) {
      let x = {
        xDiv: null,
        ui: $(`
							<div class='pop-window'>
								<div class="xDiv">
									<header>
									  <span class="title">${tit}</span>
										<span class='pop-close'>x</span>
									</header>
									<article class="content">
                  </article>
                  <footer>
                  </footer>
								</div>
							</div>
						`),
        remove: function () {
          x.ui.remove();
        },
        init: function () {
          $('body').append(this.ui);
          
          this.xDiv = this.ui.find("div.xDiv");
          this.ui.find(".content").append(view);
          
          this.ui.find('header > .pop-close').click(function () {
            x.remove();
          });
        }
      };
      x.init();
      return x;
    }
  }
};

let issue_menu = {
  img_path: '',
  menuSort: data => {
    //将菜单进行排序整理
    let cache = [];
    let names = [];
    for (let o of  data) {
      names.push(o.name);
    }
    names.sort();
    for (let name of names) {
      for (let o of data) {
        if (o.name === name) {
          cache.push(o);
          break;
        }
      }
    }
    return cache;
  },
  bindSelectClick: () => {
    $("div.menu-option > i.menu-select").click(function () {
      $(this).toggleClass('select-expand');
      if ($(this).hasClass('select-expand')) {
        $('ul.menu-option-ul').css({
          'display': 'block'
        })
      } else {
        $('ul.menu-option-ul').css({
          'display': 'none'
        })
      }
    });
  },
  classifyManage: () => {
    $('ul.menu-option-ul > li.menu-classify-create').click(function () {
      let current_classify = null;
      let ul = $(this).parent();
      
      let view = $(`
          <section class="n-section ele_show">
            <div class="n-form-item">
              <lable>分类名称:</lable>
              <input type="text" name="create" placeholder="classify name ...">
            </div>
            <div style="height: 140px;color:red">
             <span>输入分类名称 > [创建]</span></div>
            <div class="n-button-group">
              <button class="n-tips-sure">创建</button>
              <button class="n-tips-cancel">取消</button>
              <button class="n-tips-tab1">修改分类</button>
            </div>
          </section>
          <section class="n-section ele_hide">
            <div class="n-form-item">
              <lable>选择分类:</lable>
              <select style="width: 174px;">
                <option value="">--请选择--</option>
              </select>
            </div>
             <div class="n-form-item">
              <lable>分类名称:</lable>
              <input type="text" name="modify" placeholder="choose a classify before ...">
            </div>
            <div style="height: 110px;color:red">
              <span>选择需要修改的分类 > 修改名称 > [修改|删除]</span>
            </div>
            <div class="n-button-group">
              <button class="n-tips-sure">修改</button>
              <button class="n-tips-delete">删除</button>
              <button class="n-tips-cancel">取消</button>
              <button class="n-tips-tab1">创建分类</button>
            </div>
          </section>
        `);
      
      let w = common.tips.show('分类新增和修改', view);
      w.xDiv.css({
        height: 300,
        width: 400
        // 'min-height':256
      });
      
      //修改页面中选择
      let fillClassifyToSelect = ($select, data) => {
        data = look.menuSort(data);
        for (let o of data) {
          //{"name":"Java","pid":0,"has":true,"id":2001,"create_date":1521465653931}
          let op = $(`<option value="${o.id}">${o.name}</option>`);
          $select.append(op);
        }
        $select.change(function () {
          let id = $(this).val();
          // MSG(`获取到分类的id=${id}`);
          for (let o of look.classifyNameDataSource) {
            if ((o.id + "") === id) {
              current_classify = o;
              let $input = view.find('.n-form-item > input');
              $input.val(o.name);
              $input.attr('data-id', o.id);
              break;
            }
          }
        });
      };
      fillClassifyToSelect(view.find('.n-form-item > select'), look.classifyNameDataSource);
      
      //校验，如果通过返回值，不通过提示用户并返回''
      let verify = (val, msg) => {
        let pop = (message) => {
          alert(message);
          data.status = true;
          return '';
        };
        return val === '' || val === undefined ? pop(msg) : val;
      };
      
      //获取弹窗中的数据
      let getViweData = (obj, type) => {
        let data = {
          status: false,
          needed: {
            name: ''
          }
        };
        //这里兼容两个页面的切换需要
        switch (type) {
          case '创建' :
            data.needed.name = verify(obj.find('.n-form-item > input[name=create]').val(), '输入需要创建的类型名称！');
            break;
          case '修改' :
            data.needed.name = verify(obj.find('.n-form-item > input[name=modify]').val(), '选择需要修改的类型！');
            break;
          default :
            break;
        }
        return data;
      };
      
      //确定
      view.find('.n-button-group > .n-tips-sure').click(function () {
        if ($(this).html() === '创建') {
          let data = getViweData(view, '创建');
          if (data.status) {
            return;
          } else {
            //存储数据
            // MSG(data.needed);
            APP.Act.post(data.needed, 'classify/add', data => {
              if (data) {
                layer.msg("创建成功！");
                //菜单重新加载
                look.resetForm();
              } else {
                layer.msg("创建失败！");
              }
            })
          }
        } else if ($(this).html() === '修改') {
          let data = getViweData(view, '修改');
          if (data.status) {
            return;
          } else {
            MSG('修改的结果');
            MSG(data.needed);
            MSG('当前的分类');
            MSG(current_classify);
            current_classify.name = data.needed.name;
            APP.Act.post(current_classify, 'classify/modify', data => {
              if (data) {
                layer.msg("修改成功！");
                //菜单重新加载
                look.resetForm();
              } else {
                layer.msg("修改失败！");
              }
            });
          }
        }
        w.remove();
      });
      
      //取消
      view.find('.n-button-group > .n-tips-cancel').click(() => {
        w.remove();
      });
      
      //删除
      view.find('.n-button-group > .n-tips-delete').click(function () {
        MSG(current_classify);
        
        if (confirm('确定删除吗？')) {
          APP.Act.post({id: current_classify.id}, 'classify/delete', data => {
            if (data) {
              layer.msg("删除成功！");
            } else {
              layer.msg("删除失败！");
            }
            w.remove();
            //菜单重新加载
            look.resetForm();
          });
        }
      });
      
      //两个界面的相互切换实现
      view.find('.n-button-group > .n-tips-tab1').click(() => {
        let one = w.xDiv.find('> article > .ele_show');
        let two = w.xDiv.find('> article > .ele_hide');
        one.removeClass('ele_show');
        one.addClass('ele_hide');
        two.removeClass('ele_hide');
        two.addClass('ele_show');
      });
      
      //设置成不显示
      $("div.menu-option > i.menu-select").removeClass('select-expand');
      ul.css({'display': 'none'});
    });
  },
  imgUpload: () => {
    let getView = () => {
      return $(`
        <section class="n-section">
          <div class="n-form-item">
            <label for=""></label>
            <input class="imgfileUpload" type="file">
          </div>
          <div>
          <button class="imgfileSubmit">上传到服务器</button>
            <i class="img_uri"></i>
          </div>
          <div class="img_show_box"></div>
          <div class="n-form-item">
            <button class="insertImg">添加到编辑器</button>
          </div>
        </section>
      `);
    };
    let view = getView();
    let $imginput = view.find("input.imgfileUpload");
    let $imgsubmit = view.find(".imgfileSubmit");
    let $imgshowbox = view.find(".img_show_box");
    let $insert = view.find(".insertImg");
    let imgEle = null;
    $imgsubmit.click(function () {
      let file = $imginput.prop("files")[0];
      File.upload(file, (uuid, file) => {
        imgEle = `<img src="${issue_menu.img_path + uuid}" width="100: height="100" alt="img"/>`;
        view.find("i.img_uri").html(uuid);
      });
    });
    $insert.click(function () {
      look.issueInputs._editor.setContent(imgEle, true);
      w.remove();
    });
    
    let w = common.tips.show('上传和和插入图片', view);
    w.xDiv.css({
      height: 300,
      width: 400
    });
  },
  look_select_menu: function () {
    $('div.menu-option').append($(`
          <ul class="menu-option-ul">
            <li data-option="login">用户登录</li>
            <li data-option="regist">用户注册</li>
            <li class="menu-classify-create" data-option="classify">分类管理</li>
            <!--<li data-option="imgUpload">图片上传</li>-->
          </ul>
        `));
    
    this.bindSelectClick();
    this.classifyManage();
    // this.imgUpload();
  },
};

let look = {
  //按钮集合（新增数据，重置表单，删除，更新）
  issueButtons: null,
  //issue需要获取信息的输入（类型，分类，内容）
  issueInputs: null,
  //根据分类获取的统计文章的数量
  countNumbers: null,
  //菜单加载，将查询到的文章存放的数据源
  dataSource: [],//[{cid:,data:},{cid:,data:},...]
  //分类的数据源（加载菜单的时候填充一次）
  classifyNameDataSource: null,
  //菜单加载的主节点
  menusBox: null,
  //修改查询用,当前的issue的id
  currentIssue: null,
  //用户id
  user_id: null,
  
  editor: null,
  
  adjustEditor: function () {
    // $('.look-body > .look-contents > .content-right > .edi > div').css({
    //   'width': document.body.clientWidth - 246,
    // });
    // this.issueInputs._editor.css({
    //   'width': document.body.clientWidth - 256,
    //   'min-height': 'auto',
    //   'height': document.body.clientHeight - 160//140=>160
    // });
    
    UM.getEditor("myEditor").setWidth(document.body.clientWidth - 240);
    UM.getEditor("myEditor").setHeight(document.body.clientHeight - 160);
  },
  
  menuSort: data => {
    //将菜单进行排序整理
    let cache = [];
    let names = [];
    for (let o of  data) {
      names.push(o.name);
    }
    names.sort();
    for (let name of names) {
      for (let o of data) {
        if (o.name === name) {
          cache.push(o);
          break;
        }
      }
    }
    return cache;
  },
  
  //重点改造项目
  loadIssue: function (cid) {
    let ul = $("<ul class='tree-issues'/>");//用于返回，到菜单下加载
    APP.Act.post({id: cid}, "issue/fcid", data => {
      
      //将issue进行排序整理
      let cache = [];
      let names = [];
      for (let o of  data) {
        names.push(o.title);
      }
      names.sort();
      for (let name of names) {
        for (let o of data) {
          if (o.title === name) {
            cache.push(o);
            break;
          }
        }
      }
      data = cache;
      
      //遍历数据
      for (let i = 0; i < data.length; i++) {
        //click
        let menu_issue_title_click = (e, data) => {
          e.currentIssue = data;
          let li_txt = $(`ul.new-top-sel > li[data-ci="${data.classify_id}"]`).html();
          e.issueInputs._editor.setContent(data.content);
          e.issueInputs._title.val(data.title);
          e.issueInputs._classify.val(li_txt);
          e.issueInputs._classify.attr("data-ci", data.classify_id);
          //按钮的显示隐藏设置
          e.issueButtons._save.css("display", "none");
          e.issueButtons._delete.css("display", "inline-block");
          e.issueButtons._update.css("display", "inline-block");
        };
        
        //组织一个Issue标题菜单项
        let li = $(`
            <li class='look-sub-menu-li' data-id="${data[i].id}" data-pid="${data[i].cid}" data-cid="${cid}">
              <span class='look-sub-menu-li-txt'>
                <i class='layui-icon'>&#xe705;</i>
                <span>${data[i].title}</span>
              </span>
            </li>
          `);
        li.click(function () {
          menu_issue_title_click(look, data[i])
        });
        ul.append(li);
      }
    });
    return ul;
  },
  
  updateIssue: function ($issueInputs, issueId, callback) {
    APP.Act.post({
      id: issueId,
      title: $issueInputs._title.val(),
      content: $issueInputs._editor.getContent(),
      classify_id: $issueInputs._classify.attr("data-ci"),
    }, "issue/update", function (data) {
      callback(data, $issueInputs._classify.attr("data-ci"));
    });
  },
  
  saveIssue: function ($issueInputs, userId, callback) {
    let cid = look.issueInputs._classify.attr("data-ci");
    APP.Act.post({
      title: $issueInputs._title.val(),
      content: $issueInputs._editor.getContent(),
      classify_id: $issueInputs._classify.attr("data-ci"),
      user_id: userId//look.user_id
    }, "issue/add", function (data) {
      callback(data, cid);
    });
  },
  
  deleteIssue: issueId => {
    if (confirm('确定删除吗？')) {
      let cid = look.issueInputs._classify.attr("data-ci");
      APP.Act.post({id: issueId}, "issue/delete", data => {
        if (data) {
          layer.msg("删除成功！");
        } else {
          layer.msg("删除失败！");
        }
        //菜单重新加载
        //look.resetForm();
        look.issueButtons._save.css("display", "inline-block");
        look.issueButtons._delete.css("display", "none");
        look.issueButtons._update.css("display", "none");
        look.currentIssue = null;
        look.issueInputs._editor.setContent("");
        look.issueInputs._title.val('');
        look.issueInputs._classify.val('');
        look.updateClassfyMenus(cid);
      });
    }
  },
  
  //分类的选择
  classifySelect: function (data) {
    $("ul.new-top-sel").remove();
    
    //分类选择-向下图标
    let i_select = $("i.new-select");
    let box = i_select.parent();
    let ul = $("<ul class='new-top-sel'/>");
    
    data = look.menuSort(data);
    
    for (let i = 0; i < data.length; i++) {
      ul.append($(`<li data-ci="${data[i].id}">${data[i].name}</li>`)
          .click(function () {
            box.find("input")
                .val($(this).html())
                .attr("data-ci", $(this).attr("data-ci"));
            ul.css('display', 'none');
          })
      );
    }
    box.append(ul);
    i_select.off();
    i_select.click(function () {
      $(".content-right > .head-button-group ul.new-top-sel").toggle(0, "display");
    });
  },
  
  //更新菜单项
  updateClassfyMenus: function (cid) {//cid的目的是默认展开菜单
    //统计issue数量
    APP.Act.post({}, 'issue/count', data => {
      
      //获取统计数据
      look.countNumbers = data;
      log('数量统计');
      log(data);
      //页面加载菜单的功能
      let menusBox = $(".look-contents > .content-left > .menu-div-box > ul.look-menus");
      menusBox.empty();
      let load_menu = (data, $box, cid) => {
        
        //获取指定分类id下的issue的数量
        let getNumberById = id => {
          for (let o of look.countNumbers) {
            if (o.id === parseInt(id)) {
              return o.num;
            }
          }
        };
        
        //菜单项的点击执行事件
        let menuItemClickEvent = ($e, id) => {
          $e.siblings("ul").remove();
          $e.after(look.loadIssue(id));
          if ($e.attr("data-expand") === "false") {
            $e.attr("data-expand", true);
          } else {
            $e.attr("data-expand", false);
            $e.next().toggle(0, "display");
          }
        };
        
        //菜单排序
        data = look.menuSort(data);
        
        //菜单的加载
        for (let i = 0; i < data.length; i++) {
          let li = $(`
            <li data-has="${data[i].has}" data-pid="${data[i].pid}"
              data-ctime="${data[i].create_date}" data-id="${data[i].id}"
              data-expand=false>
              <b class='look-menu-li'>
                <i class='layui-icon'>&#xe61d;</i>
                <span>${data[i].name}</span>
                <i class="icon-count">${getNumberById(data[i].id)}</i>
              </b>
            </li>
          `);
          li.click(function () {
            menuItemClickEvent($(this), data[i].id);
          });
          $box.append(li);
          
          if (i === 0) {
            if (cid === undefined) {
              cid = data[i].id;
            }
          }
        }
        
        $box.find(`li[data-id=${cid}]`).trigger('click');
      };
      
      APP.Act.post({id: 0}, "classify/fpid", data => {
        log('菜单加载');
        log(data);
        load_menu(data, menusBox, cid);
        look.classifyNameDataSource = data;
        look.classifySelect(data);
      });
    });
  },
  
  resetForm: function () {
    look.issueButtons._save.css("display", "inline-block");
    look.issueButtons._delete.css("display", "none");
    look.issueButtons._update.css("display", "none");
    look.currentIssue = null;
    look.issueInputs._editor.setContent("");
    look.issueInputs._title.val('');
    look.issueInputs._classify.val('');
    look.updateClassfyMenus();
  },
  
  initIssueButtons: e => {
    e.issueButtons = {
      _new: $("button.new-blank"),
      _save: $("button.new-save"),
      _reset: $("button.new-reset"),
      _delete: $("button.new-delete"),
      _update: $("button.new-update")
    };
    e.issueButtons._new.click(() => {
      look.issueButtons._save.css("display", "inline-block");
      look.issueButtons._delete.css("display", "none");
      look.issueButtons._update.css("display", "none");
      look.currentIssue = null;
      e.issueInputs._editor.setContent("");
    });
    //save button
    e.issueButtons._save.click(
        () => {
          //必须进行校验,传入需要检查项，格式[{msg:,val:},...]
          let check_empty = arr => {
            for (let o of arr) {
              if (o.val === '') {
                layer.msg(o.msg);
                return true;
              }
            }
          };
          
          //检空判别
          if (check_empty([
                {msg: '你还没有输入Issue名称！', val: e.issueInputs._title.val()},
                {msg: '你还没有选择分类！', val: e.issueInputs._classify.val()}
              ])) {
            return;
          }
          
          let cid = e.issueInputs._classify.attr('data-ci');
          
          e.saveIssue(e.issueInputs, e.user_id, data => {
            //look.resetForm();
            look.issueButtons._save.css("display", "inline-block");
            look.issueButtons._delete.css("display", "none");
            look.issueButtons._update.css("display", "none");
            look.currentIssue = null;
            look.issueInputs._editor.setContent("");
            look.issueInputs._title.val('');
            look.issueInputs._classify.val('');
            look.updateClassfyMenus(parseInt(cid));
            
            if (data) {
              layer.msg("新增成功！");
            } else {
              layer.msg("存储失败！");
            }
          });
        }
    );
    //reset button
    e.issueButtons._reset.click(
        () => {
          e.resetForm();
        }
    );
    //delete button
    e.issueButtons._delete.click(
        () => {
          e.deleteIssue(e.currentIssue.id);
        }
    );
    //update button
    e.issueButtons._update.click(
        () => {
          e.updateIssue(e.issueInputs, e.currentIssue.id, (data, cid) => {
            //菜单重新加载
            e.updateClassfyMenus(cid);
            if (data) {
              layer.msg("更新成功！");
            } else {
              layer.msg("存储失败！");
            }
          });
        }
    );
    
    e.issueButtons._delete.css("display", "none");
    e.issueButtons._update.css("display", "none");
  },
  
  initIssueInputs: e => {
    e.issueInputs = {
      _editor: initUmEditor('myEditor'),//编辑器必须在你绑定之前初始化，他会将script标签代替掉，生成div
      _title: $("input[name='title']"),
      _classify: $("input[name='classify']")
    };
  },
  
  init: function () {
    //init html
    this.initIssueButtons(this);
    this.initIssueInputs(this);
    
    //Login
    let login = (e) => {
      if (sessionStorage.getItem("USER_INFO") === null) {
        //直接模拟登录:
        APP.Act.post(
            {username: "root", password: "root"},
            "user/login",
            function (d) {
              function success() {
                sessionStorage.setItem("USER_INFO", JSON.stringify(d[0]));
                layer.msg("登录成功！");
                location.reload();
              }
              
              d[0].id > 0 ? success() : layer.msg("登录失败！");
            }
        );
      }
      let userInfo = sessionStorage.getItem("USER_INFO");
      let uif = JSON.parse(userInfo);
      e.user_id = uif.id;
    };
    login(this);
    
    //Init
    this.updateClassfyMenus();
    
    //去除富文本编辑器的默认的一些属性样式，设置成我需要的
    this.adjustEditor();
    
    //增加右侧编辑区中的选择菜单
    issue_menu.look_select_menu();
    
    //窗体变化则自动调整editer的大小
    window.addEventListener('resize', () => {
      look.adjustEditor();
    }, false);
  }
};


