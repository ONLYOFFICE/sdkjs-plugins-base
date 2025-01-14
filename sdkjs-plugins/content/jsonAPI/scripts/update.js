(function (window, undefined) {
   const Api = window.parent.g_asc_plugins.api;

   function update() {

      // Чтение сохраненных ранее на скрытом листе настроек 
      var ActiveSheet = Api.GetActiveSheet();
      var ActiveSheetName = ActiveSheet.GetName();
      // var plugin_sheet = Api.GetSheet("jsonAPI_plugin_" + ActiveSheetName);
      var plugin_sheet = Api.GetSheet("jsonAPI_plugin");

      if (plugin_sheet) {
         var d = plugin_sheet.GetRange("A1:D100").GetValue2(); // Массив всех значений настроек запросов (история запросов задана жестко - не более 100 запросов)
         let settings = {};
         d.forEach(el => {
            if (el[0] != "") {
               settings.Sheet = el[3]; // Лист, для которого применяются настройки запросов               
               if (settings.Sheet === ActiveSheetName) { // Проверяем для текущего ли листа эти настройки, есла да, то считываем остальные, нет - игнорим
               settings.UrlRequest = el[0];
               settings.JsonPathExpr = el[1];
               settings.Range = el[2];
               console.log("Запрос к НСИ " + settings.UrlRequest);
               console.log("JsonPathExpr " + settings.JsonPathExpr);
               console.log("Range " + settings.Range);

               let xhr = new XMLHttpRequest();
               xhr.open('GET', settings.UrlRequest, false);
               
               try {
                 xhr.send();
                 if (xhr.status != 200) {
                   alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
                 } else {
                  //  console.log(xhr.response);
                   var ans = JSON.parse(xhr.responseText);
                  //  console.log(ans);
                   var jsonpathexprs = settings.JsonPathExpr.split(';'); // Парсим выражения jsonpath, написанные  через ; (точку с запятой)
                   var res = [];
                   jsonpathexprs.forEach(jsonpathexpr => {
                      res.push(jsonPath(ans, jsonpathexpr));
                   });

                   Api.GetActiveSheet().GetRange(settings.Range).Clear();
                   console.log("res " + res);
                   Api.GetActiveSheet().GetRange(settings.Range).SetValue(res);
                 }
               } catch(err) { // для отлова ошибок используем конструкцию try...catch вместо onerror
                 alert("Запрос не удался "+err);
                 console.log(err);
               }
              
               // fetch(settings.UrlRequest)
               //    // Делаем запросы к API НСИ
               //    .then(response => response.json())
               //    .then(ans => {
               //       var jsonpathexprs = settings.JsonPathExpr.split(';'); // Парсим выражения jsonpath, написанные  через ; (точку с запятой)
               //       var res = [];
               //       jsonpathexprs.forEach(jsonpathexpr => {

               //          res.push(jsonPath(ans, jsonpathexpr));
               //       });

               //       Api.GetActiveSheet().GetRange(settings.Range).Clear();
               //       console.log("res " + res);
               //       Api.GetActiveSheet().GetRange(settings.Range).SetValue(res);
                     
               //    }
               //    );
            }
         }
         });
         Api.Save();
         console.log("Отчет обновлен!")
      } else {
         console.log("Нет сохраненных запросов")
      };
   };



   window.Asc.plugin.init = function (text) { // Обязательная функция window.Asc.plugin.init исполняется при инициализации выполнения плагина
      console.log("Выполняем обновление");
      update();
      this.executeCommand("close", "");
   };

   window.Asc.plugin.button = function (id) { // обязательная функция window.Asc.plugin.button
      this.executeCommand("close", "");

   };

}
)(window, undefined);
