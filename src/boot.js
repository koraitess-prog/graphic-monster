// Keep a readable first screen even when a module or connection fails.
import('./app.js?v=paperfall2').catch(error=>{
 console.error('Unable to start Graphic Monster',error);
 const copy=document.querySelector('#copy');
 copy.innerHTML='<h1 class="intro-title">GRAPHIC<br>MONSTER</h1><button class="primary" type="button">Reload</button>';
 copy.querySelector('button').addEventListener('click',()=>location.reload());
});
