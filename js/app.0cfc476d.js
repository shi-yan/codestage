(function(){"use strict";var e={72755:function(e,t,n){var o=n(49242),i=(n(57658),n(73396)),r=n(87139);const u={style:{width:"100%",display:"flex","flex-direction":"column"}},s={ref:"menu",class:"menu"},a={class:"menu-title"},c={class:"menu-content"},l={class:"tool-bar"},f=["filename","onClick"],d={class:"tab-button-text"},m=(0,i._)("div",{style:{"flex-grow":"1"}},null,-1),h={key:0,class:"tab-button"},p=(0,i._)("span",{class:"tab-button-text"},"REPO",-1),b=(0,i._)("span",{class:"tab-button-text"},"RUN",-1),g={class:"main",ref:"main"},v={class:"editor",id:"container",ref:"container"},y={id:"adjust-bar",ref:"movableBar"},w={class:"output",id:"output",ref:"output"},_={ref:"outputWindow",class:"sandbox"};function k(e,t,n,o,k,O){const F=(0,i.up)("menu-item"),C=(0,i.up)("menu-icon"),B=(0,i.up)("file-outline-icon"),j=(0,i.up)("git-icon"),E=(0,i.up)("play-icon");return(0,i.wg)(),(0,i.iD)("div",u,[(0,i._)("div",s,[(0,i._)("h2",a,(0,r.zw)(e.content.title),1),(0,i._)("div",c,[(0,i._)("ul",null,[((0,i.wg)(!0),(0,i.iD)(i.HY,null,(0,i.Ko)(e.content.content,(e=>((0,i.wg)(),(0,i.j4)(F,{key:e.title,item:e},null,8,["item"])))),128))])])],512),(0,i._)("div",l,[(0,i._)("button",{style:{"z-index":"200"},onClick:t[0]||(t[0]=(...e)=>O.onMenuButtonClicked&&O.onMenuButtonClicked(...e)),class:"tab-button"},[(0,i.Wm)(C,{style:{"vertical-align":"middle"}})]),((0,i.wg)(!0),(0,i.iD)(i.HY,null,(0,i.Ko)(e.files,(t=>((0,i.wg)(),(0,i.iD)("button",{filename:t.filename,key:t.filename,ref_for:!0,ref:t=>e.fileRefs.push(t),onClick:e=>{O.onLoadFile(e,t)},class:"tab-button"},[(0,i.Wm)(B,{style:{"vertical-align":"middle"}}),(0,i._)("span",d,(0,r.zw)(t.filename),1)],8,f)))),128)),m,e.content.repo?((0,i.wg)(),(0,i.iD)("button",h,[(0,i.Wm)(j,{style:{"vertical-align":"middle"}}),p])):(0,i.kq)("",!0),(0,i._)("button",{onClick:t[1]||(t[1]=(...e)=>O.onRun&&O.onRun(...e)),class:"tab-button"},[(0,i.Wm)(E,{style:{"vertical-align":"middle"}}),b])]),(0,i._)("div",g,[(0,i._)("div",v,null,512),(0,i._)("div",y,null,512),(0,i._)("div",w,[(0,i._)("iframe",_,null,512)],512)],512)])}var O=n(35485),F=n(44870);const C={class:"menu-item clickable-item"},B={key:0};function j(e,t,n,o,u,s){const a=(0,i.up)("menu-item",!0);return(0,i.wg)(),(0,i.iD)("li",C,[(0,i._)("h3",{class:(0,r.C_)({clickable:n.item.folder}),onClick:t[0]||(t[0]=(...e)=>s.onSelect&&s.onSelect(...e))},(0,r.zw)(n.item.title),3),n.item.sub_chapters&&n.item.sub_chapters.length>0?((0,i.wg)(),(0,i.iD)("ul",B,[((0,i.wg)(!0),(0,i.iD)(i.HY,null,(0,i.Ko)(n.item.sub_chapters,(e=>((0,i.wg)(),(0,i.j4)(a,{key:e.title,item:e},null,8,["item"])))),128))])):(0,i.kq)("",!0)])}var E={name:"MenuItem",components:{},props:{item:Object},data:function(){return{}},mounted:async function(){},methods:{onSelect:function(){console.log("clicked =="),this.eventBus.emit("load",this.item)}}},L=n(40089);const P=(0,L.Z)(E,[["render",j]]);var x=P,M=n(64501),S=n(18516),$=n(9403),T=n(71407);let D=null,R=new Map;var I={name:"App",components:{MenuItem:x,FileOutlineIcon:M.Z,MenuIcon:S.Z,PlayIcon:$.Z,GitIcon:T.Z},data:function(){return{content:(0,F.iH)({}),currentFolder:(0,F.iH)({}),files:(0,F.iH)([]),fileRefs:(0,F.iH)([]),isMenuOpen:(0,F.iH)(!1)}},beforeUnmount:function(){this.eventBus.off("load")},mounted:async function(){this.content=await this.fetchContent(),document.title=this.content.title;const e=window.location.search,t=new URLSearchParams(e),o=t.get("sample");this.currentFolder=o&&this.getDetailsByFolder(o)||this.getFirstFolderDetails(),null!==this.currentFolder&&(this.files=[],this.files.push(...this.currentFolder.files)),this.eventBus.on("load",(e=>{this.onLoadSample(e)})),this.$nextTick((async()=>{let e=this.$refs["movableBar"],t=0,o=0,i=0,r=0,u=this,s=function(e){e.stopPropagation(),e.preventDefault();const n=e.screenX-t;o=u.$refs["container"].getBoundingClientRect().width,i=u.$refs["output"].getBoundingClientRect().width,r=u.$refs["main"].getBoundingClientRect().width;const s=100*(o+n)/r;u.$refs["container"].style.width=`${s}%`;const a=100*(i-n)/r;u.$refs["output"].style.width=`${a}%`,t=e.screenX},a=function(e){e.stopPropagation(),e.preventDefault(),document.removeEventListener("mousemove",s),document.removeEventListener("mouseup",a),u.updateIFrameSize(),u.$refs["outputWindow"].style.pointerEvents="auto",u.$refs["container"].style.pointerEvents="auto"},c=null;window.onresize=()=>{console.log("resize"),c&&clearTimeout(c),c=setTimeout((()=>{u.updateIFrameSize()}),500)},e.onmousedown=function(e){t=e.screenX,document.addEventListener("mousemove",s),document.addEventListener("mouseup",a),u.$refs["outputWindow"].style.pointerEvents="none",u.$refs["container"].style.pointerEvents="none",e.stopPropagation(),e.preventDefault()},u.updateIFrameSize();const l=await n.e(8041).then(n.t.bind(n,88041,19));O.editor.defineTheme("codestage",l),O.editor.setTheme("codestage"),D=O.editor.create(document.getElementById("container"),{value:"",language:void 0,automaticLayout:!0,suggest:{showSnippets:!1,showWords:!1,showKeywords:!1,showVariables:!1,showModules:!1},overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,guides:{indentation:!1},codeLens:!1,ordBasedSuggestions:!1,suggestOnTriggerCharacters:!1,wordBasedSuggestions:!1,snippetSuggestions:"none",hover:{enabled:!1}}),this.onLoadFile(null,this.files[0])}))},methods:{getFirstFolderDetails:function(){function e(t){if(t.folder)return t;if(t.sub_chapters&&t.sub_chapters.length>0)for(let n of t.sub_chapters){const t=e(n);if(null!==t)return t}return null}for(let t of this.content.content){const t=e();if(null!==t)return t}return null},getDetailsByFolder:function(e){function t(n){if(n.folder===e)return n;if(n.sub_chapters&&n.sub_chapters.length>0)for(let e of n.sub_chapters){const n=t(e);if(null!==n)return n}return null}for(let n of this.content.content){const e=t(n);if(null!==e)return e}return null},fetchContent:async function(){let e=await fetch("codestage/manifest.json"),t=await e.json();return t},onLoadSample:function(e){console.log(e),this.$refs["menu"].classList.remove("slide"),window.location="codestage/?sample="+e.folder},onMenuButtonClicked:function(){this.isMenuOpen?(this.isMenuOpen=!1,this.$refs["menu"].classList.remove("slide")):(this.isMenuOpen=!0,this.$refs["menu"].classList.add("slide"))},fetchFileByPath:async function(e){if(R.has(e)){const t=R.get(e);return t}{let t=await fetch("codestage/"+e),n=await t.text();const o=O.editor.createModel(n,void 0,O.Uri.file(e));return R.set(e,o),o}},onLoadFile:async function(e,t){for(let i of this.fileRefs)i.getAttribute("filename")===t.filename?i.classList.add("active"):i.classList.remove("active");const n=this.currentFolder.folder+"/"+t.filename,o=await this.fetchFileByPath(n);D.setModel(o),document.title=this.currentFolder.title+" - "+t.filename},onRun:async function(){this.currentFolder.folder;const e=await this.fetchFileByPath(path),t=e.getValue();let n=document.implementation.createHTMLDocument("preview");n.documentElement.innerHTML=t;let o=n.getElementsByTagName("script");for(let u=0;u<o.length;++u){const e=o[u].getAttribute("src");if(e)for(let t of this.currentFolder.files)if(t.filename===e){const t=this.currentFolder.folder+"/"+e;o[u].removeAttribute("src");const n=await this.fetchFileByPath(t),i=n.getValue();o[u].textContent=i;break}}let i=n.head.getElementsByTagName("base");if(i.length>0)for(let u=0;u<i.length;++u)i[u].setAttribute("href",this.currentFolder.folder+"/");else{let e=document.createElement("base");e.setAttribute("href",this.currentFolder.folder+"/"),n.head.appendChild(e)}let r=this.$refs["outputWindow"].contentDocument;r.removeChild(r.documentElement),this.$refs["outputWindow"].srcdoc=n.documentElement.innerHTML},updateIFrameSize:function(){const e=document.getElementById("output").getBoundingClientRect();let t=this.$refs["outputWindow"];t.style.width=e.width+"px",t.style.height=e.height+"px"}}};const H=(0,L.Z)(I,[["render",k]]);var W=H,z=n(1373);const A=(0,z.Z)(),N=(0,o.ri)(W);N.config.globalProperties.eventBus=A,N.mount("#app")}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}n.m=e,function(){n.amdO={}}(),function(){var e=[];n.O=function(t,o,i,r){if(!o){var u=1/0;for(l=0;l<e.length;l++){o=e[l][0],i=e[l][1],r=e[l][2];for(var s=!0,a=0;a<o.length;a++)(!1&r||u>=r)&&Object.keys(n.O).every((function(e){return n.O[e](o[a])}))?o.splice(a--,1):(s=!1,r<u&&(u=r));if(s){e.splice(l--,1);var c=i();void 0!==c&&(t=c)}}return t}r=r||0;for(var l=e.length;l>0&&e[l-1][2]>r;l--)e[l]=e[l-1];e[l]=[o,i,r]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){var e,t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__};n.t=function(o,i){if(1&i&&(o=this(o)),8&i)return o;if("object"===typeof o&&o){if(4&i&&o.__esModule)return o;if(16&i&&"function"===typeof o.then)return o}var r=Object.create(null);n.r(r);var u={};e=e||[null,t({}),t([]),t(t)];for(var s=2&i&&o;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((function(e){u[e]=function(){return o[e]}}));return u["default"]=function(){return o},n.d(r,u),r}}(),function(){n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,o){return n.f[o](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+e+"."+{15:"13f76dc5",386:"03b4e893",413:"8236f89b",501:"44294480",622:"2abc7afe",786:"84a34ee7",1022:"431054ac",1030:"2d5d87d8",1319:"79ee2e44",1598:"b682ef2e",1636:"f113fafe",2008:"f1172f71",2250:"8d8d9f5b",2341:"27d6e6cc",2358:"a451fe61",2401:"7796a552",2532:"8925772b",2784:"b06db95e",2804:"519ff986",2936:"a82f932b",3202:"0531132f",3263:"fa8188a6",3268:"8b192092",3415:"e6d08110",3629:"902b7d66",3700:"fe9d41c6",3703:"c1a9b307",3817:"73cc9fb1",3956:"770596f4",3986:"253e41d3",4034:"68211c66",4366:"3797acc3",4962:"978f3694",5019:"ee10aef2",5096:"a0111547",5106:"4d4e803f",5191:"1ee02c18",5254:"f436479d",5527:"0566006f",5630:"7ced7307",5661:"1d741b78",5662:"f0a0a4c0",5710:"6db4021d",5856:"5002bad9",5985:"54c7d311",6044:"0b0ecb58",6048:"2f558611",6346:"82fb665c",6388:"aae971b3",6540:"b6d3e6bb",6590:"4ff59ea5",6786:"29450d17",6862:"c1f93732",6877:"c1acaa99",6896:"33f49d5f",7007:"6d17d027",7010:"87ff4115",7083:"698235b4",7099:"e18c45ea",7146:"57cde5ab",7271:"95c47405",7473:"bcf3430a",7500:"a36f41f0",7517:"5cdab8c9",7643:"465d2225",7954:"85a27eff",7973:"abe1a813",8041:"e9bcaa10",8248:"5da86022",8412:"3bfa0318",8647:"13f27162",8822:"640b5c1d",9007:"0497d83a",9111:"f5fe74df",9270:"1cf6ba79",9380:"0304f697",9583:"1d7bc537",9674:"210026df",9700:"7e086ed1",9765:"29a0a64f",9903:"764e4c3f",9906:"8498b4ff",9928:"7abd468e"}[e]+".js"}}(),function(){n.miniCssF=function(e){}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="CodePlay:";n.l=function(o,i,r,u){if(e[o])e[o].push(i);else{var s,a;if(void 0!==r)for(var c=document.getElementsByTagName("script"),l=0;l<c.length;l++){var f=c[l];if(f.getAttribute("src")==o||f.getAttribute("data-webpack")==t+r){s=f;break}}s||(a=!0,s=document.createElement("script"),s.charset="utf-8",s.timeout=120,n.nc&&s.setAttribute("nonce",n.nc),s.setAttribute("data-webpack",t+r),s.src=o),e[o]=[i];var d=function(t,n){s.onerror=s.onload=null,clearTimeout(m);var i=e[o];if(delete e[o],s.parentNode&&s.parentNode.removeChild(s),i&&i.forEach((function(e){return e(n)})),t)return t(n)},m=setTimeout(d.bind(null,void 0,{type:"timeout",target:s}),12e4);s.onerror=d.bind(null,s.onerror),s.onload=d.bind(null,s.onload),a&&document.head.appendChild(s)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="codestage/"}(),function(){var e={2143:0};n.f.j=function(t,o){var i=n.o(e,t)?e[t]:void 0;if(0!==i)if(i)o.push(i[2]);else{var r=new Promise((function(n,o){i=e[t]=[n,o]}));o.push(i[2]=r);var u=n.p+n.u(t),s=new Error,a=function(o){if(n.o(e,t)&&(i=e[t],0!==i&&(e[t]=void 0),i)){var r=o&&("load"===o.type?"missing":o.type),u=o&&o.target&&o.target.src;s.message="Loading chunk "+t+" failed.\n("+r+": "+u+")",s.name="ChunkLoadError",s.type=r,s.request=u,i[1](s)}};n.l(u,a,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,o){var i,r,u=o[0],s=o[1],a=o[2],c=0;if(u.some((function(t){return 0!==e[t]}))){for(i in s)n.o(s,i)&&(n.m[i]=s[i]);if(a)var l=a(n)}for(t&&t(o);c<u.length;c++)r=u[c],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(l)},o=self["webpackChunkCodePlay"]=self["webpackChunkCodePlay"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var o=n.O(void 0,[4998],(function(){return n(72755)}));o=n.O(o)})();