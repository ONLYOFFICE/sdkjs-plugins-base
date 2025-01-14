// (function (window, undefined) {
var result = []; // Результат запроса + парсинга json'а. Массив массивов значений [["GA01", "GA02"], [155, 201]]
var jsonRes; // Результат выполнения запроса в НСИ в json
const Api = window.parent.g_asc_plugins.api;

function CopyToClipboard(StrToCopy) {
    // Функция копирования в буфер обмена, на входе - строка.
    // В функции происходит какая-то дурацкая магия, более простого способа не нашел (
    var tempTextarea = $('<textarea>');
    $('body').append(tempTextarea);
    tempTextarea.val(StrToCopy).select();
    document.execCommand('copy');
    tempTextarea.remove();
    console.log('Скопировано в буфер обмена: ' + StrToCopy);
}

function update() {
    result = [];
    fetch($("#UrlRequest").val())
        .then(response => response.json())
        .then(ans => {

            // Раскомментить срочку ниже и закомментить три строки выше для локальной отладки 
            //  $.getJSON("https://raw.githubusercontent.com/VyachL84/onlyoffice.github.io/master/sdkjs-plugins/content/prostor/example.json", function(ans) {
            jsonRes = ans;
            $('#data').jstree({
                "checkbox": {
                    "keep_selected_style": false,
                    "three_state": false,
                    "cascade": 'down+undetermined'
                },
                "plugins": ["checkbox", "search"],
                'core': {
                    'multiple': true,
                    'data': jsonToJsTreeObject(ans)
                }
            });
            var to = false;
            $('#dataSearch').keyup(function () {
                if (to) { clearTimeout(to); }
                to = setTimeout(function () {
                    var v = $('#dataSearch').val();
                    $('#data').jstree(true).search(v);
                }, 250);
            });
            $('#data')
                .on("changed.jstree", function (e, data) {
                    if (data.selected.length) {
                        console.log("Длина выбранного массива данных: " + data.selected.length);
                        console.log("Данные" + data.selected);
                        var DataSel = []; // Массив выбранных данных
                        data.selected.forEach(element => {
                            DataSel.push(data.instance.get_node(element).text);
                        });
                        CopyToClipboard(DataSel);
                        // CopyToClipboard(data.instance.get_node(data.selected[0]).text);
                    }
                });
            jsonpathexprs = $("#JsonPathExpr").val().split(';'); // Парсим выражения jsonpath, написанные  через ; (точку с запятой)
            jsonpathexprs.forEach(jsonpathexpr => console.log(jsonpathexpr));
            jsonpathexprs.forEach(jsonpathexpr => {
                result.push(jsonPath(ans, jsonpathexpr));
            });
            // $('#result').val(result);
            tableCreate(result);
            console.log("Результат получен!");
            console.table(result);
        }
        );

};

function tableCreate(result) {
    // Функция формирования таблицы результатов
    var tbl_old = document.getElementById('ResTbl');
    if (tbl_old) {
        tbl_old.parentNode.removeChild(tbl_old)
    };
    const body = document.body,
        tbl = document.createElement('table');
    tbl.setAttribute("id", "ResTbl");
    tbl.style.width = '100px';
    tbl.style.border = '1px solid black';
    for (let i = 0; i < result.length; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < result[i].length; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(`${result[i][j]}`));
            td.style.border = '1px solid black';
        }
    }
    body.appendChild(tbl);
}




function load_settings() {
    // Чтение сохраненных ранее на скрытом листе настроек 
    var ActiveSheet = Api.GetActiveSheet();
    // var ActiveSheetName = ActiveSheet.GetName();
    // var plugin_sheet = Api.GetSheet("jsonAPI_plugin_" + ActiveSheetName);
    var plugin_sheet = Api.GetSheet("jsonAPI_plugin");


    if (plugin_sheet) {
        // var IsVisPluginSheet = plugin_sheet.GetRange("K1").GetValue2();
        // console.log("Видимость страницы настроек " + IsVisPluginSheet);
        // $('#IsVisiblePluginSheet').prop('checked', IsVisPluginSheet);
        var d = plugin_sheet.GetRange("A1:D100").GetValue2(); // Массив всех значений настроек запросов (истрия запросов задана жестко - не более 100 запросов)
        let settings = {};
        d.forEach(el => {
            if (el[0] != "") {
                settings.Sheet = el[3]; // Лист, для которого применяются настройки запросов
                if (settings.Sheet === ActiveSheet.GetName()) { // Проверяем для текущего ли листа эти настройки, есла да, то считываем остальные, нет - игнорим
                    settings.UrlRequest = el[0];
                    settings.JsonPathExpr = el[1];
                    settings.Range = el[2];
                }
            }
        });
        $('#UrlRequest').val(settings.UrlRequest); // Значение 
        $('#JsonPathExpr').val(settings.JsonPathExpr); // Последнее значение в столбце А - это строка jsonPathexpr

    } else {
        console.log("Создаем лист")
        // var ActiveSheet = Api.GetActiveSheet();
        // Api.AddSheet("jsonAPI_plugin_" + ActiveSheet.GetName());
        Api.AddSheet("jsonAPI_plugin");
        var plugin_sheet = Api.GetSheet("jsonAPI_plugin");
        // plugin_sheet.SetVisible(true);
        Api.GetSheet(ActiveSheet.GetName()).SetActive();
        Api.Save();
    }
}

window.Asc.plugin.init = function (text) { // Обязательная функция window.Asc.plugin.init исполняется при инициализации выполнения плагина
    console.log("Инициализация плагина");
    load_settings();
    update();

    $(document).ready(function () {
        $('#btn').click(function () {
            // Обработка кнопки обновления
            $('#data').jstree('destroy');
            update();
        });
        $('#btnCopy').click(function () {
            CopyToClipboard(JSON.stringify(jsonRes));
        });
        // $('#IsVisiblePluginSheet').change(function () {
            // Обработка чекбокса видимости листа настроек запросов
            // var jsonAPI_plugin_sheet = Api.GetSheet("jsonAPI_plugin"); // Получим лист с настройками
            // var is_visible_plugin_sheet = $('#IsVisiblePluginSheet').prop('checked');
            // jsonAPI_plugin_sheet.SetVisible(is_visible_plugin_sheet);
            // jsonAPI_plugin_sheet.GetRange("K1").SetValue(is_visible_plugin_sheet);
        // });
    });
};

window.Asc.plugin.button = function (id) { // обязательная функция window.Asc.plugin.button
    Asc.scope.result = result; // Для использования внешних переменных в функция API OnlyOffice необходимо туда прокинуть их значения
    Asc.scope.UrlRequest = $("#UrlRequest").val();
    Asc.scope.JsonPathExpr = $("#JsonPathExpr").val();
    if (id == 0) {

        console.log("Вставляем результат в ячейки ...");

        this.callCommand(function () {
            var range = Api.GetSelection().GetAddress();
            Api.GetRange(range).Clear();
            Api.GetRange(range).SetValue(Asc.scope.result)

            // var plugin_sheet = Api.GetSheet("jsonAPI_plugin_" + Api.GetActiveSheet().GetName());
            var plugin_sheet = Api.GetSheet("jsonAPI_plugin");
            console.log("Сохраняем в истории запросов");
            var col = plugin_sheet.GetCols("A").GetValue(); // Массив всех значений столбца A
            var dd = [];
            col.forEach(el => {
                if (el != "") {
                    dd.push(el) // Делаем массив текстовых значений столбца А
                }
            });
            // console.log("запишем в url request " + dd[dd.length - 2]);
            // console.log("запишем в JsonPathExpr " + dd[dd.length - 1]);
            plugin_sheet.GetRange("A" + (dd.length + 1)).SetValue(Asc.scope.UrlRequest);
            plugin_sheet.GetRange("B" + (dd.length + 1)).SetValue(Asc.scope.JsonPathExpr);
            plugin_sheet.GetRange("C" + (dd.length + 1)).SetValue(range);
            plugin_sheet.GetRange("D" + (dd.length + 1)).SetValue(Api.GetActiveSheet().GetName());
            Api.Save();

        }, true);
        this.executeCommand("close", "");
    }
    if ((id == -1) || (id == 1)) {
        console.log("Выход без сохранения результата")
        this.executeCommand("close", "");
    }

};

// }
// )(window, undefined);
