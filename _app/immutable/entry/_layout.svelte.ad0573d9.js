import{S as z,i as B,s as F,G as Q,k as g,a as D,q as A,l as k,m as y,c as $,r as G,h as p,H as W,n as m,b as U,I as i,J as X,K as Y,L as Z,M as ee,g as te,d as le,N as se,O as ae}from"../chunks/index.96236947.js";import{j as E,e as ie}from"../chunks/singletons.352fbd16.js";E.disable_scroll_handling;const ne=E.goto;E.invalidate;E.invalidateAll;E.preload_data;E.preload_code;E.before_navigate;E.after_navigate;const re=""+new URL("../assets/ssv-logo.22db6cee.png",import.meta.url).href;function R(c,l,t){const a=c.slice();return a[5]=l[t],a}function T(c,l){let t,a=l[5].label+"",r,b,h,v;function _(){return l[4](l[5])}return{key:c,first:null,c(){t=g("div"),r=A(a),b=D(),this.h()},l(f){t=k(f,"DIV",{class:!0});var n=y(t);r=G(n,a),b=$(n),n.forEach(p),this.h()},h(){m(t,"class","cursor-pointer hover:opacity-80 items-center flex p-2"),this.first=t},m(f,n){U(f,t,n),i(t,r),i(t,b),h||(v=se(t,"click",_),h=!0)},p(f,n){l=f},d(f){f&&p(t),h=!1,v()}}}function oe(c){let l,t,a,r,b,h,v,_,f,n,d=[],j=new Map,w,V,q,I,C,S,x=c[0];const H=e=>e[5].label;for(let e=0;e<x.length;e+=1){let s=R(c,x,e),u=H(s);j.set(u,d[e]=T(u,s))}const M=c[3].default,o=Q(M,c,c[2],null);return{c(){l=g("div"),t=g("div"),a=g("div"),r=g("img"),h=D(),v=g("div"),_=A("Survival Skills Vietnam"),f=D(),n=g("div");for(let e=0;e<d.length;e+=1)d[e].c();w=D(),V=g("div"),o&&o.c(),q=D(),I=g("div"),C=A("© 2018 Survival Skill Vietnam"),this.h()},l(e){l=k(e,"DIV",{class:!0});var s=y(l);t=k(s,"DIV",{class:!0});var u=y(t);a=k(u,"DIV",{class:!0});var L=y(a);r=k(L,"IMG",{src:!0,class:!0}),h=$(L),v=k(L,"DIV",{class:!0});var J=y(v);_=G(J,"Survival Skills Vietnam"),J.forEach(p),L.forEach(p),f=$(u),n=k(u,"DIV",{class:!0});var K=y(n);for(let N=0;N<d.length;N+=1)d[N].l(K);K.forEach(p),u.forEach(p),w=$(s),V=k(s,"DIV",{class:!0});var O=y(V);o&&o.l(O),O.forEach(p),q=$(s),I=k(s,"DIV",{class:!0});var P=y(I);C=G(P,"© 2018 Survival Skill Vietnam"),P.forEach(p),s.forEach(p),this.h()},h(){W(r.src,b=re)||m(r,"src",b),m(r,"class","svelte-n1c5mi"),m(v,"class","ml-2"),m(a,"class","flex text-2xl p-3 flex-row h-full items-center border-r border-r-white"),m(n,"class","flex text-xl flex-1 self-stretch"),m(t,"class","main__header svelte-n1c5mi"),m(V,"class","main__body svelte-n1c5mi"),m(I,"class","main__footer svelte-n1c5mi"),m(l,"class","main svelte-n1c5mi")},m(e,s){U(e,l,s),i(l,t),i(t,a),i(a,r),i(a,h),i(a,v),i(v,_),i(t,f),i(t,n);for(let u=0;u<d.length;u+=1)d[u]&&d[u].m(n,null);i(l,w),i(l,V),o&&o.m(V,null),i(l,q),i(l,I),i(I,C),S=!0},p(e,[s]){s&3&&(x=e[0],d=X(d,s,H,1,e,x,j,n,ae,T,null,R)),o&&o.p&&(!S||s&4)&&Y(o,M,e,e[2],S?ee(M,e[2],s,null):Z(e[2]),null)},i(e){S||(te(o,e),S=!0)},o(e){le(o,e),S=!1},d(e){e&&p(l);for(let s=0;s<d.length;s+=1)d[s].d();o&&o.d(e)}}}function ce(c,l,t){let{$$slots:a={},$$scope:r}=l;const b=[{label:"Phân Loại Tài Chính",route:`${ie}/financial-report`}],h=_=>{ne(_)},v=_=>{h(_.route)};return c.$$set=_=>{"$$scope"in _&&t(2,r=_.$$scope)},[b,h,r,a,v]}class ue extends z{constructor(l){super(),B(this,l,ce,oe,F,{})}}export{ue as default};