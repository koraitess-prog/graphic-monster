// Keep a readable first screen even when a module or connection fails.
import('./app.js?v=laboratory1').catch(error=>{
 console.error('Unable to start Graphic Monster',error);
 const copy=document.querySelector('#copy');
 document.body.classList.add('intro-paper');
 copy.innerHTML='<h1 class="intro-title paper-title illustrated-title" aria-label="GRAPHIC MONSTER"><img src="./assets/intro-title.webp" width="1920" height="600" alt=""></h1><button class="primary" type="button">Reload</button>';
 copy.querySelector('button').addEventListener('click',()=>location.reload());
});
