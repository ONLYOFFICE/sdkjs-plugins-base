(function(window, undefined)
{
	window.AI = window.AI || {};
	var AI = window.AI;

	AI.isLocalDesktop = (function(){
		if (window.navigator && window.navigator.userAgent.toLowerCase().indexOf("ascdesktopeditor") < 0)
			return false;
		if (window.location && window.location.protocol == "file:")
			return true;
		if (window.document && window.document.currentScript && 0 == window.document.currentScript.src.indexOf("file:///"))
			return true;
		return false;
	})();

	AI.isLocalUrl = function(url) {
		let filter = ["localhost", "127.0.0.1"];
		for (let i = 0, len = filter.length; i < len; i++) {
			let pos = url.indexOf(filter[i]);
			if (pos >= 0 && pos < 10)
				return true;
		}
		return false;
	};

	if (!AI.isLocalDesktop)
		return;

	window.fetch = function(url, obj) {
		function TextResponse(text, isOk) {
			if (isOk)
				this.textResponse = text;
			else
				this.message = text;

			this.text = function() { return new Promise(function(resolve) {
				resolve(text)
			})};
			this.json = function() { return new Promise(function(resolve, reject) {
				try {
					resolve(JSON.parse(text));
				} catch (error) {
					reject(error);
				}
			})};
			this.ok = isOk;
		};

		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(obj.method, url, true);

			for (let h in obj.headers)
				if (obj.headers.hasOwnProperty(h))
					xhr.setRequestHeader(h, obj.headers[h]);

			xhr.onload = function() {
				if (this.status == 200 || this.status == 0)
					resolve(new TextResponse(this.response, true));
				else
					resolve(new TextResponse(this.response, false));
			};
			xhr.onerror = function() {
				reject(new TextResponse(this.response, false));
			};

			xhr.send(obj.body);
		});
	};
})(window);

(function(window, undefined)
{
	function requestWrapper(message) {
		return new Promise(function (resolve, reject) {
			if (AI.isLocalDesktop && AI.isLocalUrl(message.url)) {
				window.AscSimpleRequest.createRequest({
					url: message.url,
					method: message.method,
					headers: message.headers,
					body: message.isBlob ? message.body : (message.body ? JSON.stringify(message.body) : ""),
					complete: function(e, status) {
						let data = JSON.parse(e.responseText);
						resolve({error: 0, data: data.data ? data.data : data});
					},
					error: function(e, status, error) {
						if ( e.statusCode == -102 ) e.statusCode = 404;
						resolve({error: e.statusCode, message: ""});
					}
				});
			} else {
				let request = {
					method: message.method,
					headers: message.headers
				};
				if (request.method != "GET")
					request.body = message.isBlob ? message.body : (message.body ? JSON.stringify(message.body) : "");

				fetch(message.url, request)
					.then(function(response) {
						return response.json()
					})
					.then(function(data) {
						if (data.error)
							resolve({error: 1, message: data.error.message ? data.error.message : ""});
						else
							resolve({error: 0, data: data.data ? data.data : data});
					})
					.catch(function(error) {
						resolve({error: 1, message: error.message ? error.message : ""});                        
					});
			}
		});
	}

	AI.getModels = async function(provider)
	{
		return new Promise(function (resolve, reject) {
			let headers = {};
			headers["Content-Type"] = "application/json";
			if (provider.key)
				headers["Authorization"] = "Bearer " + provider.key;

			requestWrapper({
				url : provider.url + AI.Endpoints.getUrl(AI.Endpoints.Types.v1.Models),
				headers : headers,
				method : "GET"
			}).then(function(data) {
				if (data.error)
					resolve({
						error : 1,
						message : data.message,
						models : []
					});
				else {
					let providerEngineCheckModel = AI.Storage.getProviderPrototypeByName(provider.name);
					provider.models = [];
					provider.modelsUI = [];
					for (let i = 0, len = data.data.length; i < len; i++)
					{
						let model = data.data[i];
						if (!model.id)
							continue;

						if (!model.name)
							model.name = model.id;
						model.endpoints = [];
						model.options = {};

						let modelUI = new AI.UI.Model(model.name, model.id, 
							provider.name, providerEngineCheckModel(model));
						provider.models.push(model);
						provider.modelsUI.push(modelUI);
					}

					AI.Storage.setModelsToProvider(provider.models);

					resolve({
						error : 0,
						message : "",
						models : provider.modelsUI
					});
				}
			});
		});
	};

	AI.chatRequest = async function(model, content_data)
	{
		return new Promise(function (resolve, reject) {
			let max_tokens = 0;

			// TODO: get max tokens for each model
			let max_model_tokens = 4000;
			if (model.options && model.options.max_tokens)
				max_model_tokens = model.options.max_tokens;

			if (max_model_tokens != 0)
			{
				let tokens_content = window.Asc.OpenAIEncode(content_data);
				max_tokens = max_model_tokens - tokens_content.length;
			}

			let provider = AI.storage.getProvider(model.provider);
			if (!provider)
			{
				resolve("");
				return;
			}

			let headers = {};
			headers["Content-Type"] = "application/json";
			if (provider.key)
				headers["Authorization"] = "Bearer " + provider.key;

			return requestWrapper({
				url : provider.url + "chat/completions",
				headers : headers,
				method : "POST",
				body: {
					max_tokens : max_tokens,
					model : model.nameOrigin,
					messages:[{role:"user",content:content_data}]
				}
			}).then(function(data){
					if (data.error)
						resolve("");
					else
					{
						let choice = data.data.choices[0];
						let text = "";
						if (choice.message)
							text = choice.message.content;
						if (choice.text)
							text = choice.text;

						let i = 0; let trimStartCh = "\n".charCodeAt(0);
						while (text.charCodeAt(i) === trimStartCh)
							i++;
						if (i > 0)
							text = text.substring(i);
						resolve(text);
					}
				});
		});
	};    

	

	
	function normalizeImageSize(size) {
		let width = 0, height = 0;
		if (size.width > 750 || size.height > 750)
			width = height = 1024;
		else if (size.width > 375 || size.height > 350)
			width = height = 512;
		else 
			width = height = 256;

		return {width: width, height: height, str: width + 'x' + height}
	};

	async function getImageBlob(base64)
	{
		return new Promise(function(resolve) {
			const image = new Image();
			image.onload = function() {
				const img_size = {width: image.width, height: image.height};
				const canvas_size = normalizeImageSize(img_size);
				const draw_size = canvas_size.width > image.width ? img_size : canvas_size;
				let canvas = document.createElement('canvas');
				canvas.width = canvas_size.width;
				canvas.height = canvas_size.height;
				canvas.getContext('2d').drawImage(image, 0, 0, draw_size.width, draw_size.height*image.height/image.width);
				canvas.toBlob(function(blob) {resolve({blob: blob, size: canvas_size, image_size :img_size})}, 'image/png');
			};
			image.src = img.src;
		});
	}

	AI.getRequestModel = function(name)
	{
		let model = AI.storage.getModel(name);
		if (!model || !model.provider)
		{
			return {
				chatRequest : async function(data) {
					onOpenSettingsModal();                    
				},
				imageGenerateRequest : async function(data) {
					onOpenSettingsModal();                    
				},
				imageVariationRequest : async function(data) {
					onOpenSettingsModal();                    
				}
			};
		}

		return {
			chatRequest : async function(data, block) {
				if (block !== false) 
				{
					await AI.callMethod("StartAction", ["Block", "AI (" + model.name + ")"]);
					let result = await AI.chatRequest(model, data);
					await AI.callMethod("EndAction", ["Block", "AI (" + model.name + ")"]);
					return result;
				}
				return AI.chatRequest(model, data); 
			},
			imageGenerateRequest : async function(data, block) {
				// TODO:
				//return AI.imageGenerateRequest(model, data); 
			},
			imageVariationRequest : async function(data, block) {
				// TODO:
				//return AI.imageVariationRequest(model, data); 
			},
		}
	};

})(window);