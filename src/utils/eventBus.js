// class EventBus {
//   constructor() {
//     this._events = this._events || new Map(); // 储存事件/回调键值对
//     this._maxListeners = this._maxListeners || 10; // 设立监听上限
//     this.events = this.events || new Object(); 
//   }
// }
// //首先构造函数需要存储event事件，使用键值对存储
// //然后我们需要发布事件，参数是事件的type和需要传递的参数
// EventBus.prototype.emit = function(type, ...args) { 
//     let e; 
//     e = this.events[type];  
//     // 查看这个type的event有多少个回调函数，如果有多个需要依次调用。
//     if (Array.isArray(e)) {  
//         for (let i = 0; i < e.length; i++) {   
//             e[i].apply(this, args);    
//           }  
//    } else {
//           e[0].apply(this, args);  
//          }  
//    };
//  //然后我们需要写监听函数，参数是事件type和触发时需要执行的回调函数
//  EventBus.prototype.addListener = function(type, fun) { 
//        const e = this.events[type]; 

//         if (!e) {   //如果从未注册过监听函数，则将函数放入数组存入对应的键名下
//          this.events[type]= [fun];
//         } else {  //如果注册过，则直接放入
//            e.push(fun);
//         }
//   };

//   EventBus.prototype.removeListener = function(type, fn) {
//     const handler = this._events.get(type); // 获取对应事件名称的函数清单
//     console.log(this._events);
//     // 如果是函数,说明只被监听了一次
//     if (handler && typeof handler === 'function') {
//       this._events.delete(type, fn);
//     } else {
//       let position;
//       // 如果handler是数组,说明被监听多次要找到对应的函数

//       handler.forEach((item, index) => {
//         if (item === fn) {
//           position = index;
//         } else {
//           position = -1;
//         }
//       })
//       // for (let i = 0; i < handler.length; i++) {
//       //   if (handler[i] === fn) {
//       //     position = i;
//       //   } else {
//       //     position = -1;
//       //   }
//       // }
//       // 如果找到匹配的函数,从数组中清除
//       if (position !== -1) {
//         // 找到数组对应的位置,直接清除此回调
//         handler.splice(position, 1);
//         // 如果清除后只有一个函数,那么取消数组,以函数形式保存
//         if (handler.length === 1) {
//           this._events.set(type, handler[0]);
//         }
//       } else {
//         return this;
//       }
//     }
//   };
//   const eventBus = new EventBus();
//   export default eventBus;



export default (function (exporter) {
  function isFunc(fn) { return typeof fn === "function" }
  function str(s) {
      if (s == null) {
          return null;
      }
      s = s.replace(/^\s+|\s+$/g, "");
      return s.length > 0 ? s.toLowerCase() : null;
  }

  function handler() {
      var fns = [];
      var datas = [];
      this.add = function (fn, data) {
          fns.push(fn);
          datas.push(data);
      }
      this.remove = function (fn) {
          var i = fns.indexOf(fn);
          if (i >= 0) {
              fns.splice(i, 1);
              datas.splice(i, 1);
          }
      }
      this.invoke = function (sender, data) {
          fns.forEach((fn, i) => {
              try {
                  fn(sender, data, datas[i])
              } catch (error) {
                  console.error(error);
              }
          });
      }
  }

  function eventBus() {
      var handers = {}
      this.on = function (eventName, fnOrData, fn) {
          eventName = str(eventName);
          if (eventName == null) {
              throw new Error("事件名无效");
          }
          if (!isFunc(fn)) {
              var temp = fn;
              fn = fnOrData;
              fnOrData = temp;
          }
          if (!isFunc(fn)) {
              throw new Error("必须提供事件函数");
          }
          var handle = handers[eventName];
          if (handle == null) {
              handle = new handler();
              handers[eventName] = handle;
          }
          handle.add(fn, fnOrData);
      }
      this.off = function (eventName, fn) {
          eventName = str(eventName);
          if (eventName == null) {
              return;
          }
          var handle = handers[eventName];
          if (handle != null) {
              if (fn == null) {
                  delete handers[eventName];
              } else {
                  handle.remove(fn);
              }
          }
      }
      this.fire = this.emit = this.trigger =
          function (eventName, sender, data) {
              eventName = str(eventName);
              if (eventName == null) {
                  return;
              }
              var handle = handers[eventName];
              if (handle != null) {
                  handle.invoke(sender, data);
              }
          }
      var bus = this;
      this.bindTo = function(obj){
          if(obj == null){
              throw new Error("obj is null");
          }
          for (const key in bus) {
              if (bus.hasOwnProperty(key) && key !== "bindTo") {
                  obj[key] = bus[key];
              }
          }
      }
  }
  var instance = new eventBus();
  instance.bindTo(eventBus);
  exporter(eventBus);
  
})(c => window.eventBus = c);

 