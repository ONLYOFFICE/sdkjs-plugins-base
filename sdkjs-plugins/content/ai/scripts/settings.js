var themeType = 'light';
var actionsList = [];
var aiModelsList = [];

var scrollbarList = new PerfectScrollbar("#actions-list", {});

window.Asc.plugin.init = function() {
	window.Asc.plugin.sendToPlugin("onInit");
	window.Asc.plugin.attachEvent("onUpdateActions", function(list) {
		actionsList = list;
		renderActionsList();
	});
	window.Asc.plugin.attachEvent("onUpdateModels", function(list) {
		aiModelsList = list;
		updatedComboBoxes();
	});
	window.Asc.plugin.attachEvent("onThemeChanged", onThemeChanged);

	$('#edit-ai-models label').click(function(e) {
		window.Asc.plugin.sendToPlugin("onOpenAiModelsModal");
	});
}
window.Asc.plugin.onThemeChanged = onThemeChanged;

function onThemeChanged(theme) {
	window.Asc.plugin.onThemeChangedBase(theme);
	themeType = theme.type;
	
	var classes = document.body.className.split(' ');
	classes.forEach(function(className) {
		if (className.indexOf('theme-') != -1) {
			document.body.classList.remove(className);
		}
	});
	document.body.classList.add(theme.name);
	document.body.classList.add('theme-type-' + theme.type);
	$('#actions-list img').each(function() {
		var src = $(this).attr('src');
		var newSrc = src.replace(/(icons\/)([^\/]+)(\/)/, '$1' + theme.type + '$3');
		$(this).attr('src', newSrc);
	});
}

function renderActionsList() {
	var actionsListEl = document.getElementById('actions-list');
	actionsListEl.innerHTML = '';
	actionsList.forEach(function(action, index) {
		var createdEl = document.createElement('div');
		var icon = action.icon || 'default';
		createdEl.classList.add('item');
		if(index == 0) {
			createdEl.classList.add('first');
		} else if(index == actionsList.length - 1) {
			createdEl.classList.add('last');
		}
		createdEl.innerHTML =
			'<div class="label">' +
				'<img src="resources/icons/' + themeType + '/' + icon + '.png"/>' +
				'<div>' + action.name + '</div>' +
			'</div>' +
			'<select class="ai-model-select" class=""></select>';
		actionsListEl.appendChild(createdEl);
		var selectEl = $(createdEl).find('.ai-model-select');
		selectEl.on('select2:select', function (e) {
			window.Asc.plugin.sendToPlugin("onChangeAction", { 
				id: e.params.data.actionId,
				model: e.params.data.id 
			});
		});
	});
	toggleScrollbarPadding();
	scrollbarList.update();
}

function toggleScrollbarPadding() {
	var actionsListEl = document.getElementById('actions-list');
	// Проверяем, есть ли скроллбар
	if (actionsListEl.scrollHeight > actionsListEl.clientHeight) {
		actionsListEl.classList.add('with-scrollbar');
	} else {
		actionsListEl.classList.remove('with-scrollbar');
	}
}

function updatedComboBoxes() {
	$('#actions-list .item .ai-model-select').each(function(index) {
		var selectEl = $(this);
		var action = actionsList[index];
		selectEl.select2().empty();
		selectEl.select2({
			data : aiModelsList.map(function(model) {
				return {
					id: model.id,
					text: model.name,
					actionId: action.id
				}
			}),
			minimumResultsForSearch: Infinity,
			dropdownAutoWidth: true,
			width : 150
		});
		// TODO: Если активной модели больше нету в списке, ставить null и тригерить событие на изменение модели
		selectEl.val(action.model);
		selectEl.trigger('change');
	});
}