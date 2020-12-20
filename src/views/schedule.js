window.onload = function () {
  var userInfo = null; // 当前登录人的信息
  var role = 0; // 角色，0：创建者，1：参与者，2：其他
  var scheduleId = utils.getUrlParams("scheduleid"); // 日程id
  var fromUserId = utils.getUrlParams("fromuserid"); // 谁的日程
  var curDateStr = utils.getUrlParams("date");        // 日期
  var scheduleInfo = null; // 日程信息
  utils.getUserInfo(function (data) {
    userInfo = data;
    getScheduleInfo(scheduleId);
  });
  if (!top.YixinJSBridge) {
    document.addEventListener("YixinJSBridgeReady", YixinJSReady, false);
  }
  function YixinJSReady() {
    console.log("YixinJSBridgeReady");
  }

  var editFrame = document.getElementById("schedule-edit-page");
  document.getElementById("root").addEventListener("click", function (e) {
    /**
     * @type HTMLElement
     */
    var target = e.target;
    var className = target.className;
    // alert(className);
    switch (className) {
      case "iconfont icon-pencil": // 修改
        editFrame.setAttribute("src", "./addEditSchedule.html?scheduleid=" + scheduleId);
        $("#schedule-edit-page").css("transform", "translateX(0)");
        break;
      case "iconfont icon-three-spot": // 日程操作
        $(".body-shade").show();
        $(".schedule-operates-container").show();
        break;
      case "iconfont icon-back detail-back": // 返回主页面
        if (parent === window) {
          location.href = "./index.html";
        } else {
          parent.frames[1].frameElement.style.transform = "translateX(100vw)";
        }
        break;
      case "iconfont icon-back attendent-back": // 返回详情页面
        $("#schedule-detail-page").css("transform", "translateX(0)");
        $("#attendent-detail-page").removeClass("active");
        break;
      case "iconfont icon-back qrcode-back": // 返回详情页面
        $("#qrcode-page").css("transform", "translateX(100%)");
        break;
      case "body-shade": // 隐藏日程操作
        // console.log("隐藏");
        $(".schedule-operates-container").hide();
        $(".share-type-container").hide();
        $(".body-shade").hide();
        break;
      case "schedule-option comment-option": // 评论
        console.log("评论");
        $(".first-comment-input-container").show();
        $(".first-comment-input").focus();
        break;
      case "schedule-option share-option": // 分享
        $(".body-shade").show();
        $(".share-type-container").show();
        break;
      case "head-right add-attendent": // 添加参与人
        // alert('添加参与人')
        top.YixinJSBridge.invoke("selectContacts", "", function (e) {
          var res = JSON.parse(e.err_msg);
          if (typeof res.data === "object") {
            var personList = res.data;
            var mobileList = [];
            for (var i = 0; i < personList.length; i++) {
              var item = personList[i];
              if (/^\d{6,15}$/.test(item.mobile)) {
                mobileList.push(item.mobile);
              } else {
                personList.splice(i, 1);
                i--;
              }
            }
            // alert(JSON.stringify(mobileList))
            if (mobileList.length) {
              var attendentMobileList = $(".attendent-info").data("attendents");
              if (attendentMobileList) {
                for (var i = 0; i < mobileList.length; i++) {
                  if (attendentMobileList.indexOf(mobileList[i]) !== -1) {
                    mobileList.splice(i, 1);
                    i--;
                  }
                }
              }
              // alert(
              //   "已有的参与人：" +
              //     JSON.stringify(attendentMobileList) +
              //     "要添加的的参与人：" +
              //     JSON.stringify(mobileList)
              // );

              if (mobileList.length) {
                for (var i = 0; i < mobileList.length; i++) {
                  mobileList[i] = { userBelong: 1, joinMobile: mobileList[i] };
                  attendentMobileList.push(mobileList[i]);
                }
                utils.post(
                  config.addAttendent,
                  {
                    joinUserList: mobileList,
                    calSchId: scheduleId,
                  },
                  function (res) {
                    if (res.status === "0") {
                      getAttendentList();
                      $(".attendent-count").text(attendentMobileList.length);
                      $(".attendent-info").data("attendents", attendentMobileList);
                    } else {
                      $(document).dialog({
                        type: "confirm",
                        style: "default", // default、ios、android
                        content: '<span class="info-text">添加参与人失败</span>',
                      });
                    }
                  }
                );
              } else {
                $(document).dialog({
                  type: "notice",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">参与人已存在</span>',
                  autoClose: 2000,
                });
              }
            }
          }
        });
        break;
    }
    if (
      target.parentElement.className.indexOf("comment-input-container") === -1 &&
      className !== "comment-input-container" &&
      className !== "schedule-option comment-option"
    ) {
      if ($(".first-comment-input-container").css("display") === "block") {
        $(".first-comment-input-container").hide();
      } else if ($(".reply-comment-input-container").css("display") === "block") {
        $(".reply-comment-input-container").hide();
      }
    }
  });

  // 发送评论
  $(".new-comment-send").click(function () {
    var commentText = $(this).prev().text();
    // console.log(commentText);
    var params = {
      calSchId: scheduleId,
      content: commentText,
      replyType: 0,
      haveAttach: 0,
    };
    if (this.className.indexOf("reply-comment-send") !== -1) {
      // 回复评论
      params.replyType = 1;
      params.toUserId = this.dataset.userId;
      params.parentId = this.dataset.commentId;
    }
    utils.post(config.addComment, params, function (res) {
      res = typeof res === "object" ? res : JSON.parse(res);
      if (res.status === "0") {
        if (params.replyType) {
          // 回复评论
          var parentComment = $(
            ".comment[data-comment-id=" + params.parentId + "] > .comment-right"
          );
          console.log(parentComment);
          var commentHtml =
            '<div class="sub-comment">' +
            '<img class="comment-left" src="' +
            userInfo.smallImage +
            '"/>' +
            '<div class="comment-right"><div class="comment-info"><span class="comment-user">' +
            userInfo.userName +
            '</span><span class="comment-time">' +
            utils.formatDate(new Date()).split(" ")[1] +
            '</span></div><div class="comment-content">' +
            commentText +
            "</div></div></div>";
          parentComment.append(commentHtml);
        } else {
          // 评论
          var commentHtml =
            ' <div class="comment" data-comment-id=' +
            res.data +
            " data-user-id=" +
            userInfo.userId +
            ">" +
            '<img class="comment-left" src="' +
            userInfo.smallImage +
            '"/>' +
            '<div class="comment-right"><div class="comment-info"><span class="comment-user">' +
            userInfo.userName +
            '</span><span class="comment-time">' +
            utils.formatDate(new Date()).split(" ")[1] +
            '</span></div><div class="comment-content">' +
            commentText +
            "</div></div></div>";
          $(".comment-top").after(commentHtml);
          $(".comment-area").show();
        }
      } else {
        $(document).dialog({
          type: "confirm",
          style: "default", // default、ios、android
          content: '<span class="info-text">评论失败</span>',
        });
      }
    });
    if (params.replyType) {
      $(".reply-comment-input-container").hide();
      $(".reply-comment-send").hide();
      $(".reply-comment-input").html("");
    } else {
      $(".first-comment-input-container").hide();
      $(".first-comment-send").hide();
      $(".first-comment-input").html("");
    }
  });

  // 监听评论输入
  $(".new-comment-input").bind("input propertychange", function () {
    if (this.innerText.trim()) {
      $(this).next().show();
    } else {
      $(this).next().hide();
    }
  });

  // 删除/回复评论
  $(".comment-area").delegate(".comment", "click", function () {
    var commentId = this.dataset.commentId;
    var commentUserId = this.dataset.userId;

    var _this = this;
    // console.log(commentId);
    if (userInfo.userId == commentUserId) {
      // 只能删除自己的评论
      $(document).dialog({
        type: "confirm",
        style: "default",
        content: "确定要删除吗？",
        onClickConfirmBtn: function () {
          utils.post(
            config.deleteComment,
            {
              calSchId: scheduleId,
              replyId: commentId,
            },
            function (res) {
              if (res.status === "0") {
                $(_this).remove();
              } else {
                $(document).dialog({
                  type: "confirm",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">删除评论失败</span>',
                });
              }
            }
          );
        },
      });
    } else {
      // 只能回复别人的评论
      console.log("回复");
      setTimeout(function () {
        $(".reply-comment-input-container").show();
        $(".reply-comment-input").focus();
        $(".reply-comment-send").attr("data-user-id", commentUserId);
        $(".reply-comment-send").attr("data-comment-id", commentId);
      });
    }
  });

  $(".comment-area").delegate(".sub-comment", "click", function (e) {
    e.stopPropagation();
  });

  // 接受
  $(".accept-option").click(function () {
    if (!$(this).hasClass("active")) {
      utils.post(
        config.editAttendentStatus,
        {
          calSchId: scheduleId,
          status: 1,
        },
        function (res) {
          if (res.status === "0") {
            $(document).dialog({
              type: "notice",
              style: "default", // default、ios、android
              content: '<span class="info-text">接受成功</span>',
              autoClose: 2000,
            });
            $(".refuse-option").removeClass("active");
            $(".accept-option").addClass("active");
            var attendentCount = parseInt($(".attendent-count").text());
            var acceptCount = parseInt($(".accept-count").text()) + 1;

            $(".attendent-setting > span").html(
              '邀请<span class="attendent-count">' +
              attendentCount +
              "</span>人，" +
              (attendentCount === acceptCount
                ? "全部接受"
                : '<span class="accept-count">' + acceptCount + "</span>人接受")
            );
            if (parent !== window) {
              // 修改列表模式下的该日程状态
              var curSchedules = parent.$(".schedule-row[data-schedule-id=" + scheduleId + "]");
              var scheduleTitles = curSchedules.find(".schedule-title");
              if (fromUserId && userInfo.userId != fromUserId) {
                // 来自分享人
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-shared");
              } else {
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-spot");
              }
              scheduleTitles.text(
                // 之前的状态只可能是已拒绝/未响应/已接受
                $(scheduleTitles[0]).text().replace("[已拒绝]", "").replace("[未响应]", "")
              );

              // 修改月模式下的该日程状态
              curSchedules = parent.$(
                "#month-swiper-wrapper .month-day-schedule[data-schedule-id=" + scheduleId + "]"
              );
              if (fromUserId && userInfo.userId != fromUserId) {
                // 来自分享人
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-shared");
              } else {
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-spot");
              }
              scheduleTitles = curSchedules.find("del");
              curSchedules.attr("data-status", "1");
              scheduleTitles.replaceWith("<span>" + $(scheduleTitles[0]).text() + "</span>");
            }
          } else {
            $(document).dialog({
              type: "confirm",
              style: "default", // default、ios、android
              content: '<span class="info-text">' + res.msg + "</span>",
              onClickConfirmBtn: function () {
                location.reload();
              },
            });
          }
        }
      );
    }
  });
  // 拒绝
  $(".refuse-option").click(function () {
    if (!$(this).hasClass("active")) {
      utils.post(
        config.editAttendentStatus,
        {
          calSchId: scheduleId,
          status: 3,
        },
        function (res) {
          if (res.status === "0") {
            $(document).dialog({
              type: "notice",
              style: "default", // default、ios、android
              content: '<span class="info-text">拒绝成功</span>',
              autoClose: 2000,
            });

            var attendentCount = parseInt($(".attendent-count").text());
            if ($(".accept-option.active").length) {
              $(".accept-option").removeClass("active");
              // 只有接受过，拒绝才会对改变接受人数
              var acceptElement = $(".accept-count");
              if (acceptElement.length) {
                var acceptCount = parseInt(acceptElement.text()) - 1;
              } else {
                var acceptCount = attendentCount - 1;
              }
            } else {
              var acceptElement = $(".accept-count");
              if (acceptElement.length) {
                var acceptCount = parseInt(acceptElement.text());
              } else {
                var acceptCount = attendentCount;
              }
            }
            $(".refuse-option").addClass("active");

            $(".attendent-setting > span").html(
              '邀请<span class="attendent-count">' +
              attendentCount +
              "</span>人，" +
              (attendentCount === acceptCount
                ? "全部接受"
                : '<span class="accept-count">' + acceptCount + "</span>人接受")
            );
            if (parent !== window) {
              // 修改列表模式下的该日程状态
              var curSchedules = parent.$(".schedule-row[data-schedule-id=" + scheduleId + "]");
              var scheduleTitles = curSchedules.find(".schedule-title");
              if (fromUserId && userInfo.userId != fromUserId) {
                // 来自分享人
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-shared");
              } else {
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-spot");
              }
              scheduleTitles.html(
                '<del style="color: #aaa">[已拒绝]' + $(scheduleTitles[0]).text() + "</del>"
              );

              // 修改月模式下的该日程状态
              curSchedules = parent.$(
                "#month-swiper-wrapper .month-day-schedule[data-schedule-id=" + scheduleId + "]"
              );
              if (fromUserId && userInfo.userId != fromUserId) {
                // 来自分享人
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-shared");
              } else {
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-spot");
              }
              scheduleTitles = curSchedules.find("span");
              curSchedules.attr("data-status", "3");
              scheduleTitles.replaceWith(
                '<del style="color: #aaa">' + $(scheduleTitles[0]).text() + "</del>"
              );
            }
          } else {
            $(document).dialog({
              type: "confirm",
              style: "default", // default、ios、android
              content: '<span class="info-text">拒绝日程失败</span>',
            });
          }
        }
      );
    }
  });

  $(".share-to-chat").click(function () {
    // 分享到聊天
    shareSchedule(scheduleId);
    $(".body-shade").hide();
    $(".share-type-container").hide();
  });
  $(".share-qrcode").click(function () {
    // 生成二维码
    $("#qrcode-page").css("transform", "translateX(0)");
    $(".body-shade").hide();
    $(".share-type-container").hide();
  });

  // 日程操作
  $(".schedule-operate").click(function () {
    var operateIndex = this.dataset.operateType;
    switch (operateIndex) {
      case "0": // 添加参与人
        console.log($(".attendent-info").data("attendents"));
        top.YixinJSBridge.invoke("selectContacts", "", function (e) {
          var res = JSON.parse(e.err_msg);
          if (typeof res.data === "object") {
            var personList = res.data;
            var mobileList = [];
            for (var i = 0; i < personList.length; i++) {
              var item = personList[i];
              if (/^\d{6,15}$/.test(item.mobile)) {
                mobileList.push(item.mobile);
              } else {
                personList.splice(i, 1);
                i--;
              }
            }
            if (mobileList.length) {
              var attendentMobileList = $(".attendent-info").data("attendents");
              if (attendentMobileList) {
                for (var i = 0; i < mobileList.length; i++) {
                  if (attendentMobileList.indexOf(mobileList[i]) !== -1) {
                    mobileList.splice(i, 1);
                    i--;
                  }
                }
              }
              // alert(
              //   "已有的参与人：" +
              //     JSON.stringify(attendentMobileList) +
              //     "要添加的的参与人：" +
              //     JSON.stringify(mobileList)
              // );

              if (mobileList.length) {
                for (var i = 0; i < mobileList.length; i++) {
                  mobileList[i] = { userBelong: 1, joinMobile: mobileList[i] };
                }
                utils.post(
                  config.addAttendent,
                  {
                    joinUserList: mobileList,
                    calSchId: scheduleId,
                  },
                  function (res) {
                    if (res.status === "0") {
                      location.reload();
                    } else {
                      $(document).dialog({
                        type: "confirm",
                        style: "default", // default、ios、android
                        content: '<span class="info-text">添加参与人失败</span>',
                      });
                    }
                  }
                );
              } else {
                $(document).dialog({
                  type: "notice",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">参与人已存在</span>',
                  autoClose: 2000,
                });
              }
            }
          }
        });
        $(".schedule-operates-container").hide();
        $(".body-shade").hide();
        break;
      case "1": // 分享
        $(".schedule-operates-container").hide();
        $(".share-type-container").show();
        break;
      case "2": // 取消日程
        var params = {
          calSchId: scheduleId,
          isValid: 2,
        };

        utils.post(config.deleteSchedule, params, function (res) {
          if (res.status === "0") {
            $(document).dialog({
              type: "notice",
              style: "default", // default、ios、android
              content: '<span class="info-text">取消成功</span>',
            });
            $('.schedule-operate[data-operate-type="2"]').remove();
            $(".schedule-operates-container").append(
              '<div class="schedule-operate" data-operate-type="3"><i class="iconfont icon-remove"></i><div class="border-bottom">删除</div></div>'
            );
            if (parent !== window) {
              // 修改列表模式下的该日程状态
              var scheduleTitles = parent.$(
                ".schedule-row[data-schedule-id=" + scheduleId + "] .schedule-title"
              );
              console.log(scheduleTitles.length);
              scheduleTitles.html(
                '<del style="color: #aaa">[已取消]' + $(scheduleTitles[0]).text() + "</del>"
              );

              // 修改月模式下的该日程状态
              var curSchedules = parent.$(
                "#month-swiper-wrapper .month-day-schedule[data-schedule-id=" + scheduleId + "]"
              );
              if (fromUserId && userInfo.userId != fromUserId) {
                // 来自分享人
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-shared");
              } else {
                curSchedules.find(".iconfont").removeClass("icon-wait").addClass("icon-spot");
              }
              scheduleTitles = curSchedules.find("span");
              curSchedules.attr("data-is-valid", "2");
              scheduleTitles.replaceWith(
                '<del style="color: #aaa">' + $(scheduleTitles[0]).text() + "</del>"
              );
            }
          } else {
            $(document).dialog({
              type: "confirm",
              style: "default", // default、ios、android
              content: '<span class="info-text">取消日程失败</span>',
            });
          }
        });
        break;
      case "3": // 删除
        var params = {
          calSchId: scheduleId,
          isValid: 0,
        };

        utils.post(config.deleteSchedule, params, function (res) {
          if (res.status === "0") {
            $(document).dialog({
              type: "notice",
              style: "default", // default、ios、android
              content: '<span class="info-text">删除成功</span>',
            });
            if (parent === window) {
              location.href = "./index.html";
            } else {
              if (parent !== window) {
                // 删除列表模式下的该日程
                var curSchedules = parent.$(".schedule-row[data-schedule-id=" + scheduleId + "]");
                $.each(curSchedules, function (index, item) {
                  if (!$(item).siblings().length) {
                    var day = $(item).parent().attr("data-day");
                    var month = $(item).parents(".month-schedule")[0].dataset;
                    $(item).parents(".day-schedule").remove();
                    $(
                      ".calender-day-item[data-year=" +
                      month.year +
                      "][data-month=" +
                      month.month +
                      "][data-day=" +
                      day +
                      "] .iconfont"
                    ).removeClass("icon-spot2");
                  } else {
                    if ($(item).hasClass("last-schedule")) {
                      $(item).prev().addClass("last-schedule");
                    }
                    $(item).remove();
                  }
                });

                // 删除月模式下的该日程
                curSchedules = parent.$(
                  "#month-swiper-wrapper .month-day-schedule[data-schedule-id=" + scheduleId + "]"
                );
                $.each(curSchedules, function (index, item) {
                  var siblingCount = $(item).siblings().length;
                  if (siblingCount === 3) {
                    $(item).parent().next().remove();
                  }
                  $(item).remove();
                });
              }
              parent.frames[1].frameElement.style.transform = "translateX(100vw)";
            }
          } else {
            $(document).dialog({
              type: "confirm",
              style: "default", // default、ios、android
              content: '<span class="info-text">删除日程失败</span>',
              autoClose: 2000,
            });
          }
        });
        break;
    }
  });

  /**
   * 分享日程到聊天
   * @param {*} id
   */
  function shareSchedule(id) {
    top.YixinJSBridge.invoke("selectContacts", "", function (e) {
      var res = JSON.parse(e.err_msg);
      if (typeof res.data === "object") {
        var personList = res.data;
        var mobiles = [];
        for (var i = 0; i < personList.length; i++) {
          var item = personList[i];
          if (/^\d{6,15}$/.test(item.mobile)) {
            mobiles.push(item.mobile);
          } else {
            personList.splice(i, 1);
            i--;
          }
        }
        if (mobiles.length) {
          var params = {
            toMphone: mobiles.join(","),
            calSchId: id,
            dateStr: curDateStr
          };
          utils.post(
            config.shareSchedule,
            params,
            function (res) {
              if (res.status === "0") {
                $(document).dialog({
                  type: "notice",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">已分享</span>',
                  autoClose: 2000,
                });
              } else {
                $(document).dialog({
                  type: "confirm",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">分享日程失败</span>',
                });
              }
            }
          );
        }
      }
    });
  }

  // 查看参与详情
  $(".has-attendent").click(function () {
    getAttendentList();
    $("#schedule-detail-page").css("transform", "translateX(-100%)");
    $("#attendent-detail-page").addClass("active");
  });

  /**
   * 查询日程详情
   * @param {*} scheduleId
   */
  function getScheduleInfo(scheduleId) {
    var params = {
      calSchId: scheduleId,
    };
    if (fromUserId) {
      params.fromUserId = fromUserId;
    }
    utils.post(
      config.getSchedule,
      params,
      function (res) {
        if (res.status === "0") {
          scheduleInfo = res.data;
          if (fromUserId && userInfo.userId != fromUserId) {
            // 查看的是分享人的日程
            $(".schedule-title .icon-spot").css("color", "#f90");
            $(".schedule-title-inner").append(
              '<div class="schedule-from-name">' + res.fromUser.fromUserName + "</div>"
            );
          }
          var isEnd = false; // 日程是否已结束
          if (scheduleInfo.isValid === 2) {
            // 已取消
            $(".schedule-title-value").html("<del>[已取消]" + scheduleInfo.title + "</del>");
            // 已取消的日程不能接受、拒绝、取消、添加参与人
            $(".accept-option").remove();
            $(".refuse-option").remove();
            $(".schedule-options .schedule-option").css("width", "50vw");
            $('.schedule-operate[data-operate-type="0"]').remove();
            $('.schedule-operate[data-operate-type="2"]').remove();
            $(".add-attendent").remove();
          } else {
            // 有效日程
            $(".schedule-title-value").text(scheduleInfo.title);
            var curTime = utils.formatDate(new Date());
            if (scheduleInfo.scheduleType === 1) {
              // 单次日程
              if (scheduleInfo.scheduleTimeType === 1) {
                // 时间段
                if (curTime > scheduleInfo.endDateStr + " " + scheduleInfo.endTime) {
                  // 已结束
                  isEnd = true;
                }
              }
            } else {
              // 重复日程
              if (scheduleInfo.repeatDateEndtype === 2) {
                // 指定日期结束
                var endTime = scheduleInfo.scheduleTimeType === 1 ? scheduleInfo.endTime : "24:00";
                if (curTime > scheduleInfo.repeatDateEnddate + " " + endTime) {
                  isEnd = true;
                }
              }
            }
            if (isEnd) {
              // 已结束日程没有接受、拒绝、取消、添加参与人功能
              $(".accept-option").remove();
              $(".refuse-option").remove();
              $(".schedule-options .schedule-option").css("width","50vw");
              $('.schedule-operate[data-operate-type="0"]').remove();
              $('.schedule-operate[data-operate-type="2"]').remove();
              $(".add-attendent").remove();
            } else {
              // 未结束日程
              if (scheduleInfo.createUserId == userInfo.userId) {
                // 创建者可以编辑
                $(".icon-pencil").show();
              }
            }
          }

          if (scheduleInfo.createUserId == userInfo.userId) {
            // 是创建人，可以评论、分享
            console.log("是参与人");
            $(".icon-three-spot").show();
            $(".schedule-options").show();
            $(".schedule-options").addClass("myself-schedule-options");
            if (scheduleInfo.isValid === 2 || isEnd) {
              // 已取消或已结束，能删除
              $('.schedule-operate[data-operate-type="3"]').show();
            } else {
              if (scheduleInfo.isValid === 1 && !isEnd && scheduleInfo.joinUserList.length > 1) {
                // 未取消未结束并且有参与人，有取消功能
                console.log("未结束并且有参与人");
                $('.schedule-operate[data-operate-type="2"]').show();
                $('.schedule-operate[data-operate-type="3"]').remove();
              } else {
                // 否则只能删除
                $('.schedule-operate[data-operate-type="3"]').show();
                $('.schedule-operate[data-operate-type="2"]').remove();
              }
            }
          } else {
            // 是参与人或不是参与人，不能删除/取消日程
            $('.schedule-operate[data-operate-type="2"]').remove();
            $('.schedule-operate[data-operate-type="3"]').remove();
            console.log("有可能是参与人");
            var isAttendent = false;
            for (var i = 0; i < scheduleInfo.joinUserList.length; i++) {
              var joinUser = scheduleInfo.joinUserList[i];
              if (joinUser.userId === userInfo.userId) {
                isAttendent = true;
                if (scheduleInfo.isValid === 1 && !isEnd) {
                  $(".accept-option").show();
                  $(".refuse-option").show();
                  if (joinUser.status === 1) {
                    // 已接受
                    $(".accept-option").addClass("active");
                  } else if (joinUser.status === 3) {
                    // 已拒绝
                    $(".refuse-option").addClass("active");
                  }
                }
                break;
              }
            }
            if (isAttendent) {
              // 是参与人
              console.log("是参与人");
              role = 1;
              $(".icon-three-spot").show();
              $(".schedule-options").show();
            } else {
              // 不是创建人也不是参与人
              console.log("不是创建人也不是参与人");
              role = 2;
              $(".join-schedule").show();
              $(".share-qrcode").show();
              $(".add-attendent").remove();
              $(".join-schedule").click(function () {
                // 加入日程
                utils.post(
                  config.joinSchedule,
                  { calSchId: scheduleId, userId: userInfo.userId, userType: 2, userBelong: 1 },
                  function (res) {
                    if (res.status === "0") {
                      location.reload();
                    } else {
                      $(document).dialog({
                        type: "confirm",
                        style: "default", // default、ios、android
                        content: '<span class="info-text">加入日程失败</span>',
                      });
                    }
                  }
                );
              });
            }
          }

          // 二维码分享页面
          $(".qrcode-schedule-title-value").text(scheduleInfo.title);
          $("#qrcode").qrcode({
            render: "canvas",
            width: 100,
            height: 100,
            text: location.href,
          });
          var startDate = scheduleInfo.startDateStr.split("/");
          var endDate = scheduleInfo.endDateStr.split("/");
          if (scheduleInfo.startDateStr === scheduleInfo.endDateStr) {
            // 不跨天日程
            var timeContent =
              (startDate[0] === utils.formatDate(new Date()).split(" ")[0].split("/")[0]
                ? ""
                : startDate[0] + "年") +
              startDate[1] +
              "月" +
              startDate[2] +
              "日 周" +
              utils.getDay(scheduleInfo.startDateStr) +
              (scheduleInfo.scheduleTimeType === 1
                ? " " + scheduleInfo.startTime + "-" + scheduleInfo.endTime
                : "");
            $(".qrcode-schedule-time-value").text(timeContent);
          } else {
            // 跨天日程
            var timeContent =
              (startDate[0] === utils.formatDate(new Date()).split(" ")[0].split("/")[0]
                ? ""
                : startDate[0] + "年") +
              startDate[1] +
              "月" +
              startDate[2] +
              "日 周" +
              utils.getDay(scheduleInfo.startDateStr) +
              (scheduleInfo.scheduleTimeType === 1 ? " " + scheduleInfo.startTime : "") +
              " - " +
              (endDate[0] === utils.formatDate(new Date()).split(" ")[0].split("/")[0]
                ? ""
                : endDate[0] + "年") +
              endDate[1] +
              "月" +
              endDate[2] +
              "日 周" +
              utils.getDay(scheduleInfo.endDateStr) +
              (scheduleInfo.scheduleTimeType === 1 ? " " + scheduleInfo.endDate : "");
            $(".qrcode-schedule-time-value").text(timeContent);
          }

          if (scheduleInfo.scheduleType !== 1) {
            // 非单次日程
            $(".schedule-repeat").text(repeatMap[scheduleInfo.scheduleType]);
            $(".repeat-info").show();
          }
          if (scheduleInfo.desc) {
            // 有描述信息
            $(".schedule-abstract").text(scheduleInfo.desc);
            $(".abstract-info").show();
          }
          if (scheduleInfo.scheduleTimeType === 2) {
            // 全天
            var duration =
              (new Date(scheduleInfo.endDateStr).getTime() -
                new Date(scheduleInfo.startDateStr).getTime()) /
              60000;
            var days = duration / 1440 + 1;
            if(scheduleInfo.scheduleType === 1){
              // 单次日程
              $(".schedule-date-top:first").text(startDate[1] + "月" + startDate[2] + "日");
              $(".schedule-date-top:last").text(endDate[1] + "月" + endDate[2] + "日");
              $(".schedule-date-bottom:first").text("周" + utils.getDay(scheduleInfo.startDateStr));
              $(".schedule-date-bottom:last").text("周" + utils.getDay(scheduleInfo.endDateStr));
              $(".date-duration-value").text(days + "天");
            } else {
              var curDate = curDateStr.split("/");
              $(".schedule-date-top:first").text(curDate[1] + "月" + curDate[2] + "日");
              $(".schedule-date-top:last").text(curDate[1] + "月" + curDate[2] + "日");
              $(".schedule-date-bottom:first").text("周" + utils.getDay(curDateStr));
              $(".schedule-date-bottom:last").text("周" + utils.getDay(curDateStr));
              $(".date-duration-value").text(days + "天");
            }
            var remind = scheduleInfo.remindTime
              ? fullDayRemindMap[
              (new Date(scheduleInfo.startDateStr + " 09:00").getTime() -
                new Date(scheduleInfo.remindTime).getTime()) /
              (1000 * 60 * 60 * 24)
              ] +
              "，" +
              remindTypeMap[scheduleInfo.remindType]
              : "无提醒";
            $(".schedule-remind").text(remind);
          } else {
            // 非全天
            var duration =
              (new Date(scheduleInfo.endDateStr + " " + scheduleInfo.endTime).getTime() -
                new Date(scheduleInfo.startDateStr + " " + scheduleInfo.startTime).getTime()) /
              60000;
            var days = Math.floor(duration / 1440);
            var hours = Math.floor((duration % 1440) / 60);
            var minutes = (duration % 1440) % 60;
            $(".schedule-date-top:first").text(scheduleInfo.startTime);
            $(".schedule-date-top:last").text(scheduleInfo.endTime);
            if(scheduleInfo.scheduleType === 1) {
              // 单次日程
              $(".schedule-date-bottom:first").text(
                startDate[1] + "月" + startDate[2] + "日 周" + utils.getDay(scheduleInfo.startDateStr)
              );
              $(".schedule-date-bottom:last").text(
                endDate[1] + "月" + endDate[2] + "日 周" + utils.getDay(scheduleInfo.endDateStr)
              );
            } else {
              var curDate = curDateStr.split("/");
              // alert(JSON.stringify(curDate))
              $(".schedule-date-bottom:first").text(
                curDate[1] + "月" + curDate[2] + "日 周" + utils.getDay(curDateStr)
              );
              $(".schedule-date-bottom:last").text(
                curDate[1] + "月" + curDate[2] + "日 周" + utils.getDay(curDateStr)
              );
            }
            $(".date-duration-value").text(
              (days ? days + "天 " : "") +
              (hours ? hours + "小时 " : "") +
              (minutes ? minutes + "分钟" : "")
            );
            // console.log(scheduleInfo.remindTimeLength, remindMap[scheduleInfo.remindTimeLength]);
            var remind = scheduleInfo.remindTime
              ? remindMap[scheduleInfo.remindTimeLength] +
              "，" +
              remindTypeMap[scheduleInfo.remindType]
              : "无提醒";
            $(".schedule-remind").text(remind);
          }

          // 参与人
          if (scheduleInfo.joinUserList.length > 1) {
            var joinUserList = scheduleInfo.joinUserList;
            var acceptCount = 0; // 接受人数
            var organiser = {}; // 组织人
            var attendentMobileList = [];
            for (var i = 0; i < joinUserList.length; i++) {
              attendentMobileList.push(joinUserList[i].mobile);
              if (joinUserList[i].status === 1) {
                acceptCount += 1;
              }
              if (joinUserList[i].userType === 1) {
                organiser.userId = joinUserList[i].userId;
                organiser.userName = joinUserList[i].userName;
                organiser.smallImage = joinUserList[i].smallImage;
              }
            }
            var allAccept = acceptCount === joinUserList.length; // 全部接受
            $(".attendent-setting > span").html(
              '邀请<span class="attendent-count">' +
              joinUserList.length +
              "</span>人，" +
              (allAccept
                ? "全部接受"
                : '<span class="accept-count">' + acceptCount + "</span>人接受")
            );
            $(".organizer-name").attr("src", organiser.smallImage);
            $(".orgnizer-full-name").text(
              organiser.userId == userInfo.userId ? "我" : organiser.userName
            );
            $(".attendent-info").data("attendents", attendentMobileList);
            $(".attendent-info").show();
          } else {
            $(".attendent-info").data("attendents", [scheduleInfo.joinUserList[0].mobile]);
          }

          utils.post(
            config.getCommentList,
            {
              calSchId: scheduleId,
            },
            function (res) {
              if (res.status === "0") {
                var data = res.data;
                if (data.length) {
                  var commentHtml = "";
                  $.each(data, function (index, item) {
                    commentHtml +=
                      ' <div class="comment" data-comment-id=' +
                      item.replyId +
                      " data-user-id=" +
                      item.userId +
                      ">" +
                      '<img class="comment-left" src="' +
                      item.middleImage +
                      '"/>' +
                      '<div class="comment-right"><div class="comment-info"><span class="comment-user">' +
                      item.nickName +
                      '</span><span class="comment-time">' +
                      item.conversionTime +
                      '</span></div><div class="comment-content">' +
                      item.fiterContent +
                      "</div>";
                    $.each(item.list, function (subIndex, subItem) {
                      commentHtml +=
                        '<div class="sub-comment">' +
                        '<img class="comment-left" src="' +
                        subItem.middleImage +
                        '"/>' +
                        '<div class="comment-right"><div class="comment-info"><span class="comment-user">' +
                        subItem.userName +
                        '</span><span class="comment-time">' +
                        subItem.conversionTime +
                        '</span></div><div class="comment-content">' +
                        subItem.fiterContent +
                        "</div></div></div>";
                    });
                    commentHtml += "</div></div>";
                  });
                  $(".comment-area").append(commentHtml);
                  $(".comment-area").show();
                }
              } else {
                $(document).dialog({
                  type: "confirm",
                  style: "default", // default、ios、android
                  content: '<span class="info-text">获取日程评论失败</span>',
                });
              }
            }
          );
        } else {
          $(document).dialog({
            type: "confirm",
            style: "default", // default、ios、android
            content: '<span class="info-text">获取日程详情失败</span>',
          });
        }
      },
      true
    );
  }

  // 删除参与人
  $(".attendent-tab-contents").delegate(".attendent-person", "click", function () {
    var personElement = this;
    if (role === 0) {
      // 只有创建者才能删除参与人
      var mobile = personElement.getAttribute("mobile");
      if (userInfo.mobile !== mobile) {
        $(document).dialog({
          type: "confirm",
          style: "default",
          content: "确定要删除吗？",
          onClickConfirmBtn: function () {
            utils.post(
              config.delAttendent,
              { calSchId: scheduleId, joinMobile: mobile },
              function (res) {
                if (res.status === "0") {
                  var personStatus = personElement.parentElement.getAttribute("status"); // 被删除前的状态
                  var activeTab = $(".attendent-tab.active");
                  activeTab.find("span").text(activeTab.find("span").text() - 1);
                  $(personElement).remove();
                  var attendentMobileList = $(".attendent-info").data("attendents");
                  var index = attendentMobileList.indexOf(mobile);
                  attendentMobileList.splice(index, 1);
                  if (personStatus === "1") {
                    // 已接受-1
                    var attendentCount = attendentMobileList.length;
                    var acceptElement = $(".accept-count");
                    if (acceptElement.length) {
                      var acceptCount = acceptElement.text() - 1;
                    } else {
                      var acceptCount = attendentCount;
                    }
                    $(".attendent-setting > span").html(
                      '邀请<span class="attendent-count">' +
                      attendentCount +
                      "</span>人，" +
                      (acceptCount === attendentCount
                        ? "全部接受"
                        : '<span class="accept-count">' + acceptCount + "</span>人接受")
                    );
                  } else {
                    $(".attendent-count").text(attendentMobileList.length);
                  }

                  $(".attendent-info").data("attendents", attendentMobileList);
                } else {
                  $(document).dialog({
                    type: "confirm",
                    style: "default", // default、ios、android
                    content: '<span class="info-text">删除参与人失败</span>',
                  });
                }
              }
            );
          },
        });
      } else {
        $(document).dialog({
          type: "confirm",
          style: "default", // default、ios、android
          content: '<span class="info-text">' + res.msg + "</span>",
          onClickConfirmBtn: function () {
            location.reload();
          },
        });
      }
    }
  });

  // 参与详情，tab切换
  $(".attendent-tab").click(function () {
    if (this.className.indexOf("active") === -1) {
      var status = this.getAttribute("status");
      var activeTabContent = $(".attendent-tab-content[status=" + status + "]");
      $(".attendent-tab.active").removeClass("active");
      this.classList.add("active");
      activeTabContent.siblings().hide();
      activeTabContent.show();
    }
  });

  // 获取日程参与详情
  function getAttendentList() {
    utils.post(config.getAttendentList, { calSchId: scheduleId }, function (res) {
      if (res.status === "0") {
        var data = res.data;
        var noResponseHtml = ""; // 未响应
        var noResponseCount = 0;
        var acceptedHtml = ""; // 已接受
        var acceptedCount = 0;
        var refusedHtml = ""; // 已拒绝
        var refuseCount = 0;
        $.each(data, function (index, item) {
          switch (item.status) {
            case 2: // 未响应
              noResponseHtml +=
                '<div class="attendent-person"' +
                " mobile=" +
                item.mobile +
                '><img class="attendent-person-left" src=' +
                item.smallImage +
                ' /><div class="attendent-person-right">' +
                item.userName +
                "</div></div>";
              noResponseCount += 1;
              break;
            case 1: // 已接受
              acceptedHtml +=
                '<div class="attendent-person accepted"' +
                " mobile=" +
                item.mobile +
                '><img class="attendent-person-left" src=' +
                item.smallImage +
                ' /><div class="attendent-person-right">' +
                item.userName +
                "</div></div>";
              acceptedCount += 1;
              break;
            case 3: // 已拒绝
              refusedHtml +=
                ' <div class="attendent-person refused"' +
                " mobile=" +
                item.mobile +
                '><img class="attendent-person-left" src=' +
                item.smallImage +
                ' /><div class="attendent-person-right">' +
                item.userName +
                "</div></div>";
              refuseCount += 1;
              break;
          }
        });
        $('.attendent-tab-content[status="2"]').html(noResponseHtml);
        $('.attendent-tab-content[status="1"]').html(acceptedHtml);
        $('.attendent-tab-content[status="3"]').html(refusedHtml);
        $(".no-response-count").text(noResponseCount);
        $(".accepted-count").text(acceptedCount);
        $(".refused-count").text(refuseCount);
      } else {
        $(document).dialog({
          type: "confirm",
          style: "default", // default、ios、android
          content: '<span class="info-text">获取参与详情失败</span>',
        });
      }
    });
  }

  // 保存二维码到手机
  $("#qrcode-page .save").click(function () {
    toSave(document.querySelector(".qrcode-center"));
  });
};

var remindMap = {
  0: "开始时",
  5: "5分钟前",
  15: "15分钟前",
  30: "30分钟前",
  60: "1小时前",
  1440: "1天前",
};
var fullDayRemindMap = {
  0: "当天（9:00）",
  1: "1天前（9:00）",
  2: "2天前（9:00）",
  7: "1周前（9:00）",
};
var repeatMap = {
  2: "每天重复",
  3: "每周重复",
  4: "每月重复",
  5: "每年重复",
};
var remindTypeMap = {
  1: "应用内提醒",
  2: "短信提醒",
  3: "电话提醒",
};

// 保存二维码
function toSave(element) {
  html2canvas(element).then(function (canvas) {
    const userAgent = navigator.userAgent;
    // 兼容ie
    if (userAgent.indexOf("Trident") !== -1) {
      var imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      var arr = imageUrl.split(",");
      var mime = arr[0].match(/:(.*?);/)[1];
      var bstr = atob(arr[1]);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      window.navigator.msSaveBlob(new Blob([u8arr], { type: mime }), "二维码.jpg");
    } else {
      var imageUrl = canvas.toDataURL("image/png");
      var aLink = document.createElement("a");
      aLink.style.display = "none";
      aLink.href = imageUrl;
      aLink.download = "二维码.jpg";
      document.body.appendChild(aLink);
      aLink.click();
      document.body.removeChild(aLink);
    }
    // var aLink = document.createElement("a");
    // var blob = base64ToBlob(saveUrl);
    // var evt = document.createEvent("HTMLEvents");
    // evt.initEvent("click", true, true);
    // aLink.download = "二维码.jpg";
    // aLink.href = URL.createObjectURL(blob);
    // aLink.click();
  });
}
//这里把图片转base64
function base64ToBlob(code) {
  var parts = code.split(";base64,");
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}
