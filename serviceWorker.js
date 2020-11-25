"use strict";


var cacheName = 'ginkobus-cache-v1';

var contentToCache = [
	'./index.html',
	'./manifest.webmanifest',
	'./app.js',
	'./style.css',
	'./icons/favicon.ico',
	'./icons/icon-32.png',
	'./icons/icon-64.png',
	'./icons/icon-96.png',
	'./icons/icon-128.png',
	'./icons/icon-168.png',
	'./icons/icon-180.png',
	'./icons/icon-192.png',
	'./icons/icon-256.png',
	'./icons/icon-512.png',
	'./icons/maskable_icon.png'
];

// service worker installation
self.addEventListener('install', (e) => {
	console.log('[Service Worker] Installation');
	e.waitUntil(
	    caches.open(cacheName).then((cache) => {
	        console.log('[Service Worker] Mise en cache globale: app shell et contenu');
	      	return cache.addAll(contentToCache);
	    })
	);
});

self.addEventListener('fetch', (e) => {
	if(contentToCache.some(file => e.request.url.endsWith(file.substr(2)) && ! e.request.url.endsWith("app.js"))){
		console.log('[Service Worker] Loading from cache: ' + e.request.url);
		e.respondWith(caches.match(e.request));
	} else {
		// stratégie network + mise en cache, ou alors cache, ou réponse par défaut
		e.respondWith(
			fetch(e.request)
			.then((response) => {
				return caches.open(cacheName).then((cache) => {
					console.log('[Service Worker] Fetching from network and caching resource : ' + e.request.url);
					cache.put(e.request, response.clone());
					return response;
				});
			})
			.catch(function() {
				return caches.match(e.request).then((r) => {
					console.log('[Service Worker] Looking for resource in cache: ' + e.request.url);
					return r;
					 // || new Response(JSON.stringify({ error: 1 }), { headers: { 'Content-Type': 'application/json' } }); <-- si on veut renvoyer un JSON indiquant l'erreur au lieu de laisser une erreur d'accès être capturée par l'application. 
                })
            })
        );
    }
});



self.addEventListener('activate', (e) => {
  	e.waitUntil(
    	caches.keys().then((keyList) => {
          	return Promise.all(keyList.map((key) => {
		        if(cacheName.indexOf(key) === -1) {
		        	console.log("[Service Worker] Cleaning old cache");
		          	return caches.delete(key);
		        }
      		}));
    	})
  	);
});
