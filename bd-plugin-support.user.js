// ==UserScript==
// @name BD Plugin Support
// @match https://discordapp.com/channels/*
// @grant GM_getValue
// @grant GM_setValue
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

class bdpluginsupport{
	constructor(){
		this.allplugins={}
	}
	start(){
		var self=this
		var startinterval=setInterval(_=>{
			if(document.getElementsByClassName("app")[0]){
				clearInterval(startinterval)
				var getvalue=GM_getValue("localStorage")
				let __data={}
				if(getvalue){
					try{
						__data=JSON.parse(getvalue)
					}catch(e){}
				}
				var __ls=__data
				__ls.setItem=function(name,value){ 
					__ls[name]=value
					this.save()
				}
				__ls.getItem=function(name){
					return __ls[name]||null
				}
				__ls.save=function(){
					GM_setValue("localStorage",JSON.stringify(this))
				}
				var __proxy=new Proxy(__ls,{
					set:function(target,name,val,receiver){
						__ls[name]=val
						__ls.save()
					},
					get:function(target,name,receiver){
						return __ls[name]||null
					}
				})
				window.localStorage=__proxy
				self.log("Loaded")
				self.plugins("load")
				self.plugins("start")
				self.initobserver()
			}
		},100)
	}
	plugins(funcname,passvar){
		var self=this
		for(var i in self.allplugins){
			var plugin=self.allplugins[i]
			if(typeof plugin[funcname]=="function"){
				plugin[funcname](passvar)
			}
		}
	}
	initobserver(){
		var self=this
		var observer=new MutationObserver(function(mutations){
			mutations.forEach(mutation=>{
				var target=mutation.target
				self.plugins("observer",mutation)
				if(target.className){
					if(
						target.classList.contains("title-wrap")||
						target.classList.contains("chat")
					){
						self.plugins("onSwitch")
					}
					if(target.className.indexOf("scroller messages")>=0){
						self.plugins("onMessage")
					}
				}
			})
		})
		observer.observe(document,{
			childList:true,
			subtree:true
		})
	}
	loader(obj){
		var self=this
		return setTimeout(_=>{
			var name=obj.name
			var plugin=new window[name]
			self.allplugins[name]=plugin
		})
	}
	log(msg,error){
		return console[error?"error":"log"]("%c[BD Plugin Support]%c "+msg,"font-weight:bold;color:#060","")
	}
}

class BdApiConstr{
	constructor(){
		this.injectedcss={}
	}
	injectCSS(id,css){
		var style=document.createElement("style")
		this.injectedcss[id]=style
		style.appendChild(document.createTextNode(css))
		document.head.appendChild(style)
	}
	clearCSS(id){
		var style=this.injectedcss[id]
		if(style&&style.parentNode){
			style.parentNode.removeChild(style)
		}
	}
	getPlugin(name){
		if(main.allplugins[name]){
			return main.allplugins[name]
		}else{
			return null
		}
	}
	getIpc(){
		main.log("BdApi.getIpc is not supported",1)
		return null
	}
	getCore() {
		main.log("BdApi.getCore is not supported",1)
		return null
	}
	getUserIdByName(name){
		var users=document.getElementsByClassName("member-username")
		for(var i=0;i<users.length;i++){
			var user=users[i]
			if(user.innerText.trim()==name){
				var avatarUrl=user.parentNode.parentNode.firstChild.style.backgroundImage
				return avatarUrl.match(/\d+/)
			}
		}
		return null
	}
	getUserNameById(id){
		var users=document.getElementsByClassName(".avatar-small")
		for(var i=0;i<users.length;i++){
			var user=users[i]
			var url=user.style.backgroundImage
			if(id==url.match(/\d+/)){
				return user.nextElementSibling.innerText.trim()
			}
		}
		return null
	}
	setPlaying(game){
		main.log("BdApi.setPlaying is not supported",1)
	}
	setStatus(idle_since,status){
		main.log("BdApi.setStatus is not supported",1)
	}
}

window.bdPluginStorage={
	get:function(plugin,name) {
		localStorage.getItem(plugin+":"+name)
	},
	set:function(plugin,name,value){
		localStorage.setItem(plugin+":"+name,value)
	}
}
window.settingsCookie={}
window.BdApi=new BdApiConstr()
var main=new bdpluginsupport()
main.start()
function META(obj){
	main.loader(obj)
}


// Paste plugins below
//
// replace   //META{"name":"pluginname"}*//
// with      META({"name":"pluginname"})
//
// If the plugin starts with   class pluginname{
// replace with:               window.pluginname=class pluginname{
//
// If the plugin starts with   var pluginname = function() {}
// replace with:               window.pluginname = function() {}


META({"name":"replacehighlight"})

window.replacehighlight=class replacehighlight{
	getName(){
		return "Replace and Highlight"
	}
	getDescription(){
		return "By default only adds greentext for messages with lines startinng with >"
	}
	getVersion(){
		return "2017.07.26"
	}
	getAuthor(){
		return "LoveEevee"
	}
	constructor(){
		this.replaces=[{
			on:1,
			pattern:"(^|\n)&gt;.*",
			case:0,
			replace:'<span style="color:#789922">$&</span>',
			js:0,
			caps:0,
			mark:0
		}]
		/* {
			on:1,
				// enables (1) or disables (0) the current rule
			pattern:"nigg(e?r|ar?|[ -]?nog|\\b)",
				// matching pattern, string
			case:0,
				// match case (disables "i" flag if set to 1)
			replace:"black person",
				// replacement string, can be html
			js:0,
				// "replace" will be treated as a javascript function that can read "agruments" variable, don't include "function(){}"
			caps:1,
				// automatically convert capital letters from matched string and copy those onto the replacement string, this shit is pure magic, disable if you're using html
			mark:0
				// add highlighting tags around your replacement string, compatible with caps
		} */
		this.onmessage=()=>{
			var self=this
			var markup=document.querySelectorAll(".markup:not([data-greentext])")
			for(var i=0;i<markup.length;i++){
				markup[i].dataset.greentext=""
				var walk=document.createTreeWalker(markup[i],4,null)
				var newnode
				var textnodes=[]
				while(newnode=walk.nextNode()){
					textnodes.push(newnode)
				}
				for(var j in textnodes){
					var currentnode=textnodes[j]
					var out=self.teststring(currentnode.nodeValue.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),this.replaces)
					if(out!=null){
						if(/[<>]/.test(out)){
							var newspan=document.createElement("span")
							newspan.innerHTML=out
							currentnode.parentNode.insertBefore(newspan,currentnode)
							currentnode.parentNode.removeChild(currentnode)
						}else{
							currentnode.nodeValue=out.replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&")
						}
					}
				}
			}
		}
		this.onunload=()=>{
			clearInterval(this.interval)
		}
		this.teststring=(text,patterns)=>{
			if(text.length){
				var oldtext=text
				for(var i in patterns){
					try{
						if(patterns[i].on&&patterns[i].pattern){
							var replacewith=patterns[i].replace+''
							if(patterns[i].js){
								replacewith=function(){
									return eval('(function(){'+patterns[i].replace+'}).apply(undefined,arguments)')
								}
							}else if(patterns[i].mark){
								replacewith='<span style="background:#99f;color:#ff3">'+(replacewith||'$&')+'</span>'
							}
							if(patterns[i].caps){
								var replacestring=replacewith
								replacewith=function(){
									if(patterns[i].js){
										var returned=replacestring.apply(undefined,arguments)
										var s=[returned,arguments[0]]
									}else{
										var args=arguments
										var s=[replacestring,args[0]]
										s[0]=s[0].replace(/\$&/g,'$$0').replace(/\$(\d+)/g,function(){
											var num=arguments[1]*1
											return args[num]||''
										})
									}
									var al=s[0].length
									var bl=s[1].length
									if(al>bl){
										var l=bl
									}else{
										var l=al
									}
									if(l<2){
										return s[0]
									}
									s=s.map(function(a){
										return [a.slice(0,l-l/2),a.slice(l-l/2,-l/2),a.slice(-l/2)]
									})
									for(var j=0;j<3;j+=2){
										s[0][j]=s[0][j].toLowerCase().split('')
										for(var k=0;k<s[0][j].length;k++){
											var c=s[1][j][k]
											if(c==c.toUpperCase()&&c!=c.toLowerCase()){
												s[0][j][k]=s[0][j][k].toUpperCase()
											}
										}
										s[0][j]=s[0][j].join('')
									}
									if(s[0][1]){
										var u=0
										if(s[1][1]){
											var c=s[1][1]
											if(c==c.toUpperCase()&&c!=c.toLowerCase()){
												u=2
											}
										}else{
											var c=s[1][0][(l/2|0)-1]
											if(c==c.toUpperCase()){
												u++
											}
											var c=s[1][2][0]
											if(c==c.toUpperCase()){
												u++
											}
										}
										if(u==2){
											s[0][1]=s[0][1].toUpperCase()
										}
									}
									return s[0].join('')
								}
							}else if(!patterns[i].js){
								replacewith=replacewith.replace(/\$0/g,'$$&')
							}
							var ig=patterns[i].case?'g':'ig'
							text=text.replace(new RegExp(patterns[i].pattern,ig),replacewith)
						}
					}catch(e){
						console.error('Error in regex: '+patterns[i].pattern,',',e.message)
					}
				}
				if(oldtext!=text){
					return text
				}else{
					return null
				}
			}else{
				return null
			}
		}
		this.interval=0
	}
	start(){
		this.onmessage()
	}
	stop(){
		this.onunload()
	}
	load(){
		this.interval=setInterval(this.onmessage,1000)
	}
	unload(){
		this.onunload()
	}
	onMessage(){
		this.onmessage()
	}
	onSwitch(){
		this.onmessage()
	}
}