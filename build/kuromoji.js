(function(_,d){typeof exports=="object"&&typeof module<"u"?module.exports=d():typeof define=="function"&&define.amd?define(d):(_=typeof globalThis<"u"?globalThis:_||self,_.kuromoji=d())})(this,function(){"use strict";var gt=Object.defineProperty;var yt=(_,d,v)=>d in _?gt(_,d,{enumerable:!0,configurable:!0,writable:!0,value:v}):_[d]=v;var l=(_,d,v)=>yt(_,typeof d!="symbol"?d+"":d,v);class _{constructor(t){l(this,"str");l(this,"index_mapping");l(this,"length");this.str=t,this.index_mapping=[];for(let e=0;e<t.length;e++){const i=t.charAt(e);this.index_mapping.push(e),_.isSurrogatePair(i)&&e++}this.length=this.index_mapping.length}static isSurrogatePair(t){const e=t.charCodeAt(0);return e>=55296&&e<=56319}slice(t){if(this.index_mapping.length<=t)return"";const e=this.index_mapping[t];return this.str.slice(e)}charAt(t){if(this.str.length<=t)return"";const e=this.index_mapping[t],i=this.index_mapping[t+1];return i==null?this.str.slice(e):this.str.slice(e,i)}charCodeAt(t){if(this.index_mapping.length<=t)return Number.NaN;const e=this.index_mapping[t],i=this.str.charCodeAt(e);let n;return i>=55296&&i<=56319&&e<this.str.length&&(n=this.str.charCodeAt(e+1),n>=56320&&n<=57343)?(i-55296)*1024+n-56320+65536:i}toString(){return this.str}}class d{constructor(t,e,i,n,r,s,o,c){l(this,"name");l(this,"cost");l(this,"start_pos");l(this,"length");l(this,"left_id");l(this,"right_id");l(this,"prev");l(this,"surface_form");l(this,"shortest_cost");l(this,"type");this.name=t,this.cost=e,this.start_pos=i,this.length=n,this.left_id=s,this.right_id=o,this.prev=null,this.surface_form=c,r==="BOS"?this.shortest_cost=0:this.shortest_cost=Number.MAX_VALUE,this.type=r}}class v{constructor(){l(this,"nodes_end_at");l(this,"eos_pos");this.nodes_end_at=[],this.nodes_end_at[0]=[new d(-1,0,0,0,"BOS",0,0,"")],this.eos_pos=1}append(t){const e=t.start_pos+t.length-1;this.eos_pos<e&&(this.eos_pos=e);let i=this.nodes_end_at[e];i==null&&(i=[]),i.push(t),this.nodes_end_at[e]=i}appendEos(){const t=this.nodes_end_at.length;this.eos_pos++,this.nodes_end_at[t]=[new d(-1,0,this.eos_pos,0,"EOS",0,0,"")]}}class Y{constructor(t){l(this,"trie");l(this,"token_info_dictionary");l(this,"unknown_dictionary");this.trie=t.trie,this.token_info_dictionary=t.token_info_dictionary,this.unknown_dictionary=t.unknown_dictionary}build(t){const e=new v,i=new _(t);let n,r,s,o,c;for(let a=0;a<i.length;a++){const u=i.slice(a),f=this.trie.commonPrefixSearch(u);for(let k=0;k<f.length;k++){r=f[k].v,n=f[k].k;const A=this.token_info_dictionary.target_map[r];for(let b=0;b<A.length;b++){const p=Number.parseInt(A[b].toString());s=this.token_info_dictionary.dictionary.getShort(p),o=this.token_info_dictionary.dictionary.getShort(p+2),c=this.token_info_dictionary.dictionary.getShort(p+4),e.append(new d(p,c,a+1,n.length,"KNOWN",s,o,n.toString()))}}const y=new _(u),I=new _(y.charAt(0)),S=this.unknown_dictionary.lookup(I.toString());if(f==null||f.length===0||S.is_always_invoke){let k;if(k=I,S.is_grouping&&1<y.length)for(let b=1;b<y.length;b++){const p=y.charAt(b),pt=this.unknown_dictionary.lookup(p);if(S.class_name!==pt.class_name)break;k=new _(k.str+p)}const A=this.unknown_dictionary.target_map[S.class_id];for(let b=0;b<A.length;b++){const p=Number.parseInt(A[b].toString());s=this.unknown_dictionary.dictionary.getShort(p),o=this.unknown_dictionary.dictionary.getShort(p+2),c=this.unknown_dictionary.dictionary.getShort(p+4),e.append(new d(p,c,a+1,k.length,"UNKNOWN",s,o,k.toString()))}}}return e.appendEos(),e}}class H{constructor(t){l(this,"connection_costs");this.connection_costs=t}search(t){const e=this.forward(t);return this.backward(e)}forward(t){let e,i,n;for(e=1;e<=t.eos_pos;e++){const r=t.nodes_end_at[e];if(r!=null)for(i=0;i<r.length;i++){const s=r[i];let o=Number.MAX_VALUE,c=null;const a=t.nodes_end_at[s.start_pos-1];if(a!=null){for(n=0;n<a.length;n++){const u=a[n];let f;s.left_id==null||u.right_id==null?(console.log("Left or right is null"),f=0):f=this.connection_costs.get(u.right_id,s.left_id);const y=u.shortest_cost+f+s.cost;y<o&&(c=u,o=y)}s.prev=c,s.shortest_cost=o}}}return t}backward(t){const e=[];let n=t.nodes_end_at[t.nodes_end_at.length-1][0].prev;if(n==null)return[];for(;n.type!=="BOS";){if(e.push(n),n.prev==null)return[];n=n.prev}return e.reverse()}}const W=/、|。/;class D{constructor(t,e){l(this,"token_info_dictionary");l(this,"unknown_dictionary");l(this,"viterbi_builder");l(this,"viterbi_searcher");l(this,"formatter");this.token_info_dictionary=t.token_info_dictionary,this.unknown_dictionary=t.unknown_dictionary,this.viterbi_builder=new Y(t),this.viterbi_searcher=new H(t.connection_costs),this.formatter=e}static splitByPunctuation(t){const e=[];let i=t;for(;i!=="";){const n=i.search(W);if(n<0){e.push(i);break}e.push(i.substring(0,n+1)),i=i.substring(n+1)}return e}tokenize(t){const e=D.splitByPunctuation(t),i=[];for(let n=0;n<e.length;n++){const r=e[n];this.tokenizeForSentence(r,i)}return i}tokenizeForSentence(t,e=[]){const i=this.getLattice(t),n=this.viterbi_searcher.search(i);let r=0;e.length>0&&(r=e[e.length-1].word_position);for(let s=0;s<n.length;s++){const o=n[s];let c,a,u;o.type==="KNOWN"?(u=this.token_info_dictionary.getFeatures(o.name.toString()),u==null?a=[]:a=u.split(","),c=this.formatter.formatEntry(o.name,r+o.start_pos,o.type,a)):o.type==="UNKNOWN"?(u=this.unknown_dictionary.getFeatures(o.name.toString()),u==null?a=[]:a=u.split(","),c=this.formatter.formatUnknownEntry(o.name,r+o.start_pos,o.type,a,o.surface_form)):c=this.formatter.formatEntry(o.name,r+o.start_pos,o.type,[]),e.push(c)}return e}getLattice(t){return this.viterbi_builder.build(t)}}const U="\0",T=0,g=0,m=-1,P=!0,O=!0,M=4,x=4,X=2,j=(h=1024)=>{const t=(o,c,a)=>{for(let u=c;u<a;u++)o[u]=-u+1;if(0<s.array[s.array.length-1]){let u=s.array.length-2;for(;0<s.array[u];)u--;o[c]=-u}},e=(o,c,a)=>{for(let u=c;u<a;u++)o[u]=-u-1},i=o=>{const c=o*X,a=B(r.signed,r.bytes,c);t(a,r.array.length,c),a.set(r.array),r.array=a;const u=B(s.signed,s.bytes,c);e(u,s.array.length,c),u.set(s.array),s.array=u};let n=g+1;const r={signed:P,bytes:M,array:B(P,M,h)},s={signed:O,bytes:x,array:B(O,x,h)};return r.array[g]=1,s.array[g]=g,t(r.array,g+1,r.array.length),e(s.array,g+1,s.array.length),{getBaseBuffer:()=>r.array,getCheckBuffer:()=>s.array,loadBaseBuffer:function(o){return r.array=o,this},loadCheckBuffer:function(o){return s.array=o,this},size:()=>Math.max(r.array.length,s.array.length),getBase:o=>r.array.length-1<o?-o+1:r.array[o],getCheck:o=>s.array.length-1<o?-o-1:s.array[o],setBase:(o,c)=>{r.array.length-1<o&&i(o),r.array[o]=c},setCheck:(o,c)=>{s.array.length-1<o&&i(o),s.array[o]=c},setFirstUnusedNode:o=>{n=o},getFirstUnusedNode:()=>n,shrink:function(){let o=this.size()-1;for(;!(0<=s.array[o]);)o--;r.array=r.array.subarray(0,o+2),s.array=s.array.subarray(0,o+2)},calc:()=>{let o=0;const c=s.array.length;for(let a=0;a<c;a++)s.array[a]<0&&o++;return{all:c,unused:o,efficiency:(c-o)/c}},dump:function(){let o="",c="",a;for(a=0;a<r.array.length;a++)o=`${o} ${this.getBase(a)}`;for(a=0;a<s.array.length;a++)c=`${c} ${this.getCheck(a)}`;return console.log(`base:${o}`),console.log(`chck:${c}`),`base:${o} chck:${c}`}}};class q{constructor(t){l(this,"bc");l(this,"keys");this.bc=j(t),this.keys=[]}append(t,e){return this.keys.push({k:t,v:e}),this}build(t=this.keys,e=!1){if(t==null)return new z(this.bc);const i=t.map(n=>({k:N(n.k+U),v:n.v}));return e?this.keys=i:this.keys=i.sort((n,r)=>{const s=n.k,o=r.k,c=Math.min(s.length,o.length);for(let a=0;a<c;a++)if(s[a]!==o[a])return s[a]-o[a];return s.length-o.length}),this._build(g,0,0,this.keys.length),new z(this.bc)}_build(t,e,i,n){const r=this.getChildrenInfo(e,i,n),s=this.findAllocatableBase(r);this.setBC(t,r,s);for(let o=0;o<r.length;o=o+3){const c=r[o];if(c===T)continue;const a=r[o+1],u=r[o+2],f=s+c;this._build(f,e+1,a,u)}}getChildrenInfo(t,e,i){let n=this.keys[e].k[t],r=0,s=new Int32Array(i*3);s[r++]=n,s[r++]=e;let o=e,c=e;for(;o<e+i;o++){const a=this.keys[o].k[t];n!==a&&(s[r++]=o-c,s[r++]=a,s[r++]=o,n=a,c=o)}return s[r++]=o-c,s=s.subarray(0,r),s}setBC(t,e,i){const n=this.bc;n.setBase(t,i);let r;for(r=0;r<e.length;r=r+3){const s=e[r],o=i+s,c=-n.getBase(o),a=-n.getCheck(o);o!==n.getFirstUnusedNode()?n.setCheck(c,-a):n.setFirstUnusedNode(a),n.setBase(a,-c);const u=t;if(n.setCheck(o,u),s===T){const f=e[r+1];let y=this.keys[f].v;y==null&&(y=0);const I=-y-1;n.setBase(o,I)}}}findAllocatableBase(t){const e=this.bc;let i,n=e.getFirstUnusedNode();for(;;){if(i=n-t[0],i<0){n=-e.getCheck(n);continue}let r=!0;for(let s=0;s<t.length;s=s+3){const o=t[s],c=i+o;if(!this.isUnusedNode(c)){n=-e.getCheck(n),r=!1;break}}if(r)return i}}isUnusedNode(t){const i=this.bc.getCheck(t);return t===g?!1:i<0}}class z{constructor(t){l(this,"bc");this.bc=t,this.bc.shrink()}contain(t){const e=this.bc;t+=U;const i=N(t);let n=g,r=m;for(let s=0;s<i.length;s++){const o=i[s];if(r=this.traverse(n,o),r===m)return!1;if(e.getBase(r)<=0)return!0;n=r}return!1}lookup(t){t+=U;const e=N(t);let i=g,n=m;for(let s=0;s<e.length;s++){const o=e[s];if(n=this.traverse(i,o),n===m)return m;i=n}const r=this.bc.getBase(n);return r<=0?-r-1:m}commonPrefixSearch(t){const e=N(t);let i=g,n=m;const r=[];for(let s=0;s<e.length;s++){const o=e[s];if(n=this.traverse(i,o),n!==m){i=n;const c=this.traverse(n,T);if(c!==m){const a=this.bc.getBase(c),u={k:"",v:0};a<=0&&(u.v=-a-1),u.k=Q(J(e,0,s+1)),r.push(u)}}else break}return r}traverse(t,e){const i=this.bc.getBase(t)+e;return this.bc.getCheck(i)===t?i:m}size(){return this.bc.size()}calc(){return this.bc.calc()}dump(){return this.bc.dump()}}const B=(h,t,e)=>{switch(t){case 1:return new Int8Array(e);case 2:return new Int16Array(e);case 4:return new Int32Array(e);default:throw new RangeError(`Invalid newArray parameter element_bytes:${t}`)}},J=(h,t,e)=>{const i=new ArrayBuffer(e),n=new Uint8Array(i,0,e),r=h.subarray(t,e);return n.set(r),n},N=h=>{const t=new Uint8Array(new ArrayBuffer(h.length*4));let e=0,i=0;for(;e<h.length;){let n;const r=h.charCodeAt(e++);if(r>=55296&&r<=56319){const s=r,o=h.charCodeAt(e++);if(o>=56320&&o<=57343)n=(s-55296)*1024+65536+(o-56320);else throw new Error("malformed surrogate pair")}else n=r;n<128?t[i++]=n:n<2048?(t[i++]=n>>>6|192,t[i++]=n&63|128):n<65536?(t[i++]=n>>>12|224,t[i++]=n>>6&63|128,t[i++]=n&63|128):n<1<<21&&(t[i++]=n>>>18|240,t[i++]=n>>12&63|128,t[i++]=n>>6&63|128,t[i++]=n&63|128)}return t.subarray(0,i)},Q=h=>{let t="",e,i,n,r,s,o,c,a=0;for(;a<h.length;)i=h[a++],i<128?e=i:i>>5===6?(n=h[a++],e=(i&31)<<6|n&63):i>>4===14?(n=h[a++],r=h[a++],e=(i&15)<<12|(n&63)<<6|r&63):(n=h[a++],r=h[a++],s=h[a++],e=(i&7)<<18|(n&63)<<12|(r&63)<<6|s&63),e<65536?t+=String.fromCharCode(e):(e-=65536,o=55296|e>>10,c=56320|e&1023,t+=String.fromCharCode(o,c));return t};function R(h){return new q(h)}function Z(h,t){const e=j(0);return e.loadBaseBuffer(h),e.loadCheckBuffer(t),new z(e)}class L{constructor(t,e){l(this,"buffer");l(this,"forward_dimension");l(this,"backward_dimension");this.forward_dimension=t,this.backward_dimension=e,this.buffer=new Int16Array(t*e+2),this.buffer[0]=t,this.buffer[1]=e}put(t,e,i){const n=t*this.backward_dimension+e+2;if(this.buffer.length<n+1)throw"ConnectionCosts buffer overflow";this.buffer[n]=i}get(t,e){const i=t*this.backward_dimension+e+2;if(this.buffer.length<i+1)throw"ConnectionCosts buffer overflow";return this.buffer[i]}loadConnectionCosts(t){this.forward_dimension=t[0],this.backward_dimension=t[1],this.buffer=t}}const tt=h=>{const t=new Uint8Array(h.length*4);let e=0,i=0;for(;e<h.length;){let n;const r=h.charCodeAt(e++);if(r>=55296&&r<=56319){const s=r,o=h.charCodeAt(e++);if(o>=56320&&o<=57343)n=(s-55296)*1024+65536+(o-56320);else throw new Error("malformed surrogate pair")}else n=r;n<128?t[i++]=n:n<2048?(t[i++]=n>>>6|192,t[i++]=n&63|128):n<65536?(t[i++]=n>>>12|224,t[i++]=n>>6&63|128,t[i++]=n&63|128):n<1<<21&&(t[i++]=n>>>18|240,t[i++]=n>>12&63|128,t[i++]=n>>6&63|128,t[i++]=n&63|128)}return t.subarray(0,i)},et=h=>{let t="",e,i,n,r,s,o,c,a=0;for(;a<h.length;)i=h[a++],i<128?e=i:i>>5===6?(n=h[a++],e=(i&31)<<6|n&63):i>>4===14?(n=h[a++],r=h[a++],e=(i&15)<<12|(n&63)<<6|r&63):(n=h[a++],r=h[a++],s=h[a++],e=(i&7)<<18|(n&63)<<12|(r&63)<<6|s&63),e<65536?t+=String.fromCharCode(e):(e-=65536,o=55296|e>>10,c=56320|e&1023,t+=String.fromCharCode(o,c));return t};class w{constructor(t){l(this,"buffer");l(this,"position");let e;if(t==null)e=1024*1024;else if(typeof t=="number")e=t;else if(t instanceof Uint8Array){this.buffer=t,this.position=0;return}else throw`${typeof t} is invalid parameter type for ByteBuffer constructor`;this.buffer=new Uint8Array(e),this.position=0}size(){return this.buffer.length}reallocate(){const t=new Uint8Array(this.buffer.length*2);t.set(this.buffer),this.buffer=t}shrink(){return this.buffer=this.buffer.subarray(0,this.position),this.buffer}put(t){this.buffer.length<this.position+1&&this.reallocate(),this.buffer[this.position++]=t}get(t){return t==null&&(t=this.position,this.position+=1),this.buffer.length<t+1?0:this.buffer[t]}putShort(t){if(t=Number(t),65535<t)throw`${t} is over short value`;const e=255&t,i=(65280&t)>>8;this.put(e),this.put(i)}getShort(t){if(t==null&&(t=this.position,this.position+=2),this.buffer.length<t+2)return 0;const e=this.buffer[t];let n=(this.buffer[t+1]<<8)+e;return n&32768&&(n=-(n-1^65535)),n}putInt(t){if(t=Number(t),4294967295<t)throw`${t} is over integer value`;const e=255&t,i=(65280&t)>>8,n=(16711680&t)>>16,r=(4278190080&t)>>24;this.put(e),this.put(i),this.put(n),this.put(r)}getInt(t){if(t==null&&(t=this.position,this.position+=4),this.buffer.length<t+4)return 0;const e=this.buffer[t],i=this.buffer[t+1],n=this.buffer[t+2];return(this.buffer[t+3]<<24)+(n<<16)+(i<<8)+e}readInt(){const t=this.position;return this.position+=4,this.getInt(t)}putString(t){const e=tt(t);for(let i=0;i<e.length;i++)this.put(e[i]);this.put(0)}getString(t=this.position){const e=[];let i;for(;!(this.buffer.length<t+1||(i=this.get(t++),i===0));)e.push(i);return this.position=t,et(e)}}class ${constructor(){l(this,"dictionary");l(this,"target_map");l(this,"pos_buffer");this.dictionary=new w(10*1024*1024),this.target_map={},this.pos_buffer=new w(10*1024*1024)}buildDictionary(t){const e={};for(let i=0;i<t.length;i++){const n=t[i];if(n.length<4)continue;const r=n[0],s=Number(n[1]),o=Number(n[2]),c=Number(n[3]),a=n.slice(4).join(",");(!Number.isFinite(s)||!Number.isFinite(o)||!Number.isFinite(c))&&console.log(n);const u=this.put(s,o,c,r,a);e[u]=r}return this.dictionary.shrink(),this.pos_buffer.shrink(),e}put(t,e,i,n,r){const s=this.dictionary.position,o=this.pos_buffer.position;return this.dictionary.putShort(t),this.dictionary.putShort(e),this.dictionary.putShort(i),this.dictionary.putInt(o),this.pos_buffer.putString(`${n},${r}`),s}addMapping(t,e){let i=this.target_map[t];i==null&&(i=[]),i.push(e),this.target_map[t]=i}targetMapToBuffer(){const t=new w,e=Object.keys(this.target_map).length;t.putInt(e);for(const i in this.target_map){const n=this.target_map[i],r=n.length;t.putInt(Number.parseInt(i)),t.putInt(r);for(let s=0;s<n.length;s++)t.putInt(n[s])}return t.shrink()}loadDictionary(t){return this.dictionary=new w(t),this}loadPosVector(t){return this.pos_buffer=new w(t),this}loadTargetMap(t){const e=new w(t);for(e.position=0,this.target_map={},e.readInt();!(e.buffer.length<e.position+1);){const i=e.readInt(),n=e.readInt();for(let r=0;r<n;r++){const s=e.readInt();this.addMapping(i,s)}}return this}getFeatures(t){const e=Number.parseInt(t);if(Number.isNaN(e))return"";const i=this.dictionary.getInt(e+6);return this.pos_buffer.getString(i)}}class G{constructor(t,e,i,n,r){l(this,"class_id");l(this,"class_name");l(this,"is_always_invoke");l(this,"is_grouping");l(this,"max_length");this.class_id=t,this.class_name=e,this.is_always_invoke=i,this.is_grouping=n,this.max_length=r}}class E{constructor(){l(this,"map");l(this,"lookup_table");this.map=[],this.lookup_table={}}static load(t){const e=new E,i=[],n=new w(t);for(;n.position+1<n.size();){const r=i.length,s=n.get()===1,o=n.get()===1,c=n.getInt(),a=n.getString();i.push(new G(r,a,s,o,c))}return e.init(i),e}init(t){if(t!=null)for(let e=0;e<t.length;e++){const i=t[e];this.map[e]=i,this.lookup_table[i.class_name]=e}}getCharacterClass(t){return this.map[t]}lookup(t){const e=this.lookup_table[t];if(e==null)throw new Error("null");return e}toBuffer(){const t=new w;for(let e=0;e<this.map.length;e++){const i=this.map[e];t.put(Number(i.is_always_invoke)),t.put(Number(i.is_grouping)),t.putInt(i.max_length),t.putString(i.class_name)}return t.shrink(),t.buffer}}const F="DEFAULT";class C{constructor(){l(this,"character_category_map");l(this,"compatible_category_map");l(this,"invoke_definition_map");this.character_category_map=new Uint8Array(65536),this.compatible_category_map=new Uint32Array(65536)}static load(t,e,i){const n=new C;return n.character_category_map=t,n.compatible_category_map=e,n.invoke_definition_map=E.load(i),n}static parseCharCategory(t,e){const i=e[1],n=Number.parseInt(e[2]),r=Number.parseInt(e[3]),s=Number.parseInt(e[4]);if(!Number.isFinite(n)||n!==0&&n!==1)return console.log(`char.def parse error. INVOKE is 0 or 1 in:${n}`),null;if(!Number.isFinite(r)||r!==0&&r!==1)return console.log(`char.def parse error. GROUP is 0 or 1 in:${r}`),null;if(!Number.isFinite(s)||s<0)return console.log(`char.def parse error. LENGTH is 1 to n:${s}`),null;const o=n===1,c=r===1;return new G(t,i,o,c,s)}static parseCategoryMapping(t){const e=Number.parseInt(t[1]),i=t[2],n=3<t.length?t.slice(3):[];return(!Number.isFinite(e)||e<0||e>65535)&&console.log(`char.def parse error. CODE is invalid:${e}`),{start:e,default:i,compatible:n}}static parseRangeCategoryMapping(t){const e=Number.parseInt(t[1]),i=Number.parseInt(t[2]),n=t[3],r=4<t.length?t.slice(4):[];return(!Number.isFinite(e)||e<0||e>65535)&&console.log(`char.def parse error. CODE is invalid:${e}`),(!Number.isFinite(i)||i<0||i>65535)&&console.log(`char.def parse error. CODE is invalid:${i}`),{start:e,end:i,default:n,compatible:r}}initCategoryMappings(t){if(!this.invoke_definition_map)throw new Error("invoke_definition_map is not initialized");let e;if(t!=null)for(let n=0;n<t.length;n++){const r=t[n],s=r.end||r.start;for(e=r.start;e<=s;e++){this.character_category_map[e]=this.invoke_definition_map.lookup(r.default);for(let o=0;o<r.compatible.length;o++){let c=this.compatible_category_map[e];const a=r.compatible[o];if(a==null)continue;const u=this.invoke_definition_map.lookup(a);if(u==null)continue;const f=1<<u;c=c|f,this.compatible_category_map[e]=c}}}const i=this.invoke_definition_map.lookup(F);if(i!=null)for(e=0;e<this.character_category_map.length;e++)this.character_category_map[e]===0&&(this.character_category_map[e]=1<<i)}lookupCompatibleCategory(t){if(!this.invoke_definition_map)throw new Error("invoke_definition_map is not initialized");const e=[],i=t.charCodeAt(0);let n;if(i<this.compatible_category_map.length&&(n=this.compatible_category_map[i]),n==null||n===0)return e;for(let r=0;r<32;r++)if(n<<31-r>>>31===1){const s=this.invoke_definition_map.getCharacterClass(r);if(s==null)continue;e.push(s)}return e}lookup(t){if(!this.invoke_definition_map)throw new Error("invoke_definition_map is not initialized");let e;const i=t.charCodeAt(0);return _.isSurrogatePair(t)?e=this.invoke_definition_map.lookup(F):i<this.character_category_map.length&&(e=this.character_category_map[i]),e==null&&(e=this.invoke_definition_map.lookup(F)),this.invoke_definition_map.getCharacterClass(e)}}class V extends ${constructor(){super();l(this,"character_definition");this.dictionary=new w(10*1024*1024),this.target_map={},this.pos_buffer=new w(10*1024*1024)}characterDefinition(e){return this.character_definition=e,this}lookup(e){if(!this.character_definition)throw new Error("Character definition is not initialized");return this.character_definition.lookup(e)}lookupCompatibleCategory(e){if(!this.character_definition)throw new Error("Character definition is not initialized");return this.character_definition.lookupCompatibleCategory(e)}loadUnknownDictionaries(e,i,n,r,s,o){this.loadDictionary(e),this.loadPosVector(i),this.loadTargetMap(n),this.character_definition=C.load(r,s,o)}}class K{constructor(t,e,i,n){l(this,"trie");l(this,"token_info_dictionary");l(this,"connection_costs");l(this,"unknown_dictionary");t!=null?this.trie=t:this.trie=R(0).build([{k:"",v:1}]),e!=null?this.token_info_dictionary=e:this.token_info_dictionary=new $,i!=null?this.connection_costs=i:this.connection_costs=new L(0,0),n!=null?this.unknown_dictionary=n:this.unknown_dictionary=new V}loadTrie(t,e){return this.trie=Z(t,e),this}loadTokenInfoDictionaries(t,e,i){return this.token_info_dictionary.loadDictionary(t),this.token_info_dictionary.loadPosVector(e),this.token_info_dictionary.loadTargetMap(i),this}loadConnectionCosts(t){return this.connection_costs.loadConnectionCosts(t),this}loadUnknownDictionaries(t,e,i,n,r,s){return this.unknown_dictionary.loadUnknownDictionaries(t,e,i,n,r,s),this}}class nt extends TransformStream{constructor(t){if(!["deflate","deflate-raw","gzip"].includes(t))throw new TypeError(`Unsupported compression format: ${t}`);let e;super({transform(i){if(!e)e=i;else{const n=new Uint8Array(e.length+i.length);n.set(e),n.set(i,e.length),e=n}},flush(i){try{let n;if(t==="gzip")n=Bun.gunzipSync(e);else if(t==="deflate")n=Bun.inflateSync(e);else if(t==="deflate-raw")n=Bun.inflateSync(e,{windowBits:-15});else{i.error(new TypeError("Unsupported compression format (internal error)"));return}i.enqueue(n)}catch(n){i.error(new TypeError(`Decompression failed for format '${t}'.`,{cause:n}));return}}})}}globalThis.DecompressionStream??(globalThis.DecompressionStream=nt);class it{constructor(t){l(this,"dic");l(this,"dic_path");this.dic=new K,this.dic_path=t}async loadArrayBuffer(t){let e;if(typeof globalThis.Deno<"u")e=await Deno.readFile(t);else if(typeof globalThis.Bun<"u")e=Buffer.from(await Bun.file(t).arrayBuffer());else if(typeof globalThis.process<"u")e=await(await Promise.resolve().then(()=>dt)).readFile(t);else{const s=await fetch(t);if(!s.ok)throw new Error(`Failed to fetch ${t}: ${s.statusText}`);return await s.arrayBuffer()}const i=new DecompressionStream("gzip"),n=new Blob([e]).stream().pipeThrough(i);return await new Response(n).arrayBuffer()}async load(){const t=this.dic,e=this.dic_path,i=this.loadArrayBuffer;return await Promise.all([async()=>{const n=await Promise.all(["base.dat.gz","check.dat.gz"].map(async o=>i(`${e}/${o}`))),r=new Int32Array(n[0]),s=new Int32Array(n[1]);t.loadTrie(r,s)},async()=>{const n=await Promise.all(["tid.dat.gz","tid_pos.dat.gz","tid_map.dat.gz"].map(async c=>i(`${e}/${c}`))),r=new Uint8Array(n[0]),s=new Uint8Array(n[1]),o=new Uint8Array(n[2]);t.loadTokenInfoDictionaries(r,s,o)},async()=>{const n=await i(`${e}/cc.dat.gz`),r=new Int16Array(n);t.loadConnectionCosts(r)},async()=>{const n=await Promise.all(["unk.dat.gz","unk_pos.dat.gz","unk_map.dat.gz","unk_char.dat.gz","unk_compat.dat.gz","unk_invoke.dat.gz"].map(async f=>i(`${e}/${f}`))),r=new Uint8Array(n[0]),s=new Uint8Array(n[1]),o=new Uint8Array(n[2]),c=new Uint8Array(n[3]),a=new Uint32Array(n[4]),u=new Uint8Array(n[5]);t.loadUnknownDictionaries(r,s,o,c,a,u)}].map(n=>n())),t}}class rt{formatEntry(t,e,i,n){return{word_id:t,word_type:i,word_position:e,surface_form:n[0],pos:n[1],pos_detail_1:n[2],pos_detail_2:n[3],pos_detail_3:n[4],conjugated_type:n[5],conjugated_form:n[6],basic_form:n[7],reading:n[8],pronunciation:n[9]}}formatUnknownEntry(t,e,i,n,r){return{word_id:t,word_type:i,word_position:e,surface_form:r,pos:n[1],pos_detail_1:n[2],pos_detail_2:n[3],pos_detail_3:n[4],conjugated_type:n[5],conjugated_form:n[6],basic_form:n[7]}}}class st{formatEntry(t,e,i,n){return{word_id:t,word_type:i,word_position:e,surface_form:n[1],pos:n[2],pos_detail_1:n[3],pos_detail_2:n[4],pos_detail_3:n[5],conjugated_type:n[6],conjugated_form:n[7],basic_form:n[9],reading:n[8]}}formatUnknownEntry(t,e,i,n,r){return{word_id:t,word_type:i,word_position:e,surface_form:r,pos:n[2],pos_detail_1:n[3],pos_detail_2:n[4],pos_detail_3:n[5],conjugated_type:n[6],conjugated_form:n[7],basic_form:n[10]}}}class ot{constructor(t){l(this,"dic_path");l(this,"dic_type");l(this,"dic_formatter",{UniDic:new st,IPADic:new rt});this.dic_type=t.dicType??"IPADic",this.dic_path=t.dicPath??"dict/"}async build(){const t=new it(this.dic_path);return await t.load(),new D(t.dic,this.dic_formatter[this.dic_type])}}const at=/^(\w+)\s+(\d)\s+(\d)\s+(\d)/,ct=/^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/,lt=/^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;class ht{constructor(){l(this,"char_def");l(this,"character_category_definition");l(this,"category_mapping");this.char_def=new C,this.char_def.invoke_definition_map=new E,this.character_category_definition=[],this.category_mapping=[]}putLine(t){const e=at.exec(t);if(e!=null){const r=this.character_category_definition.length,s=C.parseCharCategory(r,e);if(s==null)return;this.character_category_definition.push(s);return}const i=ct.exec(t);if(i!=null){const r=C.parseCategoryMapping(i);this.category_mapping.push(r)}const n=lt.exec(t);if(n!=null){const r=C.parseRangeCategoryMapping(n);this.category_mapping.push(r)}}build(){if(!this.char_def.invoke_definition_map)throw new Error("invoke_definition_map is not initialized");return this.char_def.invoke_definition_map.init(this.character_category_definition),this.char_def.initCategoryMappings(this.category_mapping),this.char_def}}class ut{constructor(){l(this,"lines");l(this,"connection_cost");this.lines=0}putLine(t){var s,o,c;if(this.lines===0){const a=t.split(" "),u=Number.parseInt(a[0]),f=Number.parseInt(a[1]);if(u<0||f<0)throw"Parse error of matrix.def";return this.connection_cost=new L(u,f),this.lines++,this}const e=t.split(" ");if(e.length!==3)return this;const i=Number.parseInt(e[0]),n=Number.parseInt(e[1]),r=Number.parseInt(e[2]);if(i<0||n<0||!Number.isFinite(i)||!Number.isFinite(n)||((s=this.connection_cost)==null?void 0:s.forward_dimension)<=i||((o=this.connection_cost)==null?void 0:o.backward_dimension)<=n)throw"Parse error of matrix.def";return(c=this.connection_cost)==null||c.put(i,n,r),this.lines++,this}build(){if(!this.connection_cost)throw new Error("ConnectionCosts is not initialized");return this.connection_cost}}class ft{constructor(){l(this,"tid_entries");l(this,"unk_entries");l(this,"cc_builder");l(this,"cd_builder");this.tid_entries=[],this.unk_entries=[],this.cc_builder=new ut,this.cd_builder=new ht}addTokenInfoDictionary(t){return this.tid_entries.push(t),this}putCostMatrixLine(t){return this.cc_builder.putLine(t),this}putCharDefLine(t){return this.cd_builder.putLine(t),this}putUnkDefLine(t){return this.unk_entries.push(t),this}build(){const t=this.buildTokenInfoDictionary(),e=this.buildUnknownDictionary();return new K(t.trie,t.token_info_dictionary,this.cc_builder.build(),e)}buildTokenInfoDictionary(){const t=new $,e=t.buildDictionary(this.tid_entries),i=this.buildDoubleArray();for(const n in e){const r=e[n],s=i.lookup(r);t.addMapping(s,n)}return{trie:i,token_info_dictionary:t}}buildUnknownDictionary(){const t=new V,e=t.buildDictionary(this.unk_entries),i=this.cd_builder.build();if(!i.invoke_definition_map)throw new Error("invoke_definition_map is not initialized");t.characterDefinition(i);for(const n in e){const r=e[n],s=i.invoke_definition_map.lookup(r);t.addMapping(s,n)}return t}buildDoubleArray(){let t=0;const e=this.tid_entries.map(n=>({k:n[0],v:t++}));return R(1024*1024).build(e)}}const _t={builder:h=>new ot(h),dictionaryBuilder:()=>new ft},dt=Object.freeze(Object.defineProperty({__proto__:null,default:{}},Symbol.toStringTag,{value:"Module"}));return _t});
