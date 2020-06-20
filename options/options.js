
function init() {

	console.time('init');

	function flatten(tree, location = []) {
		var items = [];
		tree.forEach(function(item) {
			if (item.url) {
				item.location = location.join('/');
				items.push(item);
			}

			if (item.children) {
				items = items.concat(flatten(item.children, location.concat(item.title)));
			}
		});
		return items;
	}

	function _html(text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
	}

	var table = document.querySelector('#bookmarks-table');
	var form = document.querySelector('#bookmarks-form');

	// var bookmarks;

	form.onsubmit = function(e) {
		e.preventDefault();

		var elements = [].filter.call(this.elements, function(element) {
			return !!element.name;
		});

		var save = {};
		elements.forEach(function(element) {
			var which = element.name.split('.');
			var name = which[0];
			var id = which[1];

			save[id] || (save[id] = {});
			save[id][name] = element.value;
		});

		console.log(save);

		var num = Object.keys(save).length;
		var message = "You will save " + num + " bookmarks. See the console.\n\nAgree?";
		if (confirm(message)) {
			for (var id in save) {
				chrome.bookmarks.update(id, save[id], function() {
					if (--num == 0) {
						location.reload();
					}
				});
			}
		}
	};

	form.onchange = function(e) {
		e.target.name = e.target.dataset.name;
	};

	chrome.bookmarks.getTree(function(results) {
		var items = flatten(results[0].children);

		document.querySelector('#num-bookmarks').textContent = items.length;

		// bookmarks = items.reduce(function(list, item) {
		// 	list[item.id] = item;
		// 	return list;
		// }, {});

		const countChildren = location => items.filter(item => item.location == location).length;

		var lastLoc = '';
		var html = '';
		for (let item of items) {
			if (item.location != lastLoc) {
				lastLoc = item.location;
				html += '<tr><th colspan="2">' + _html(item.location) + ' (' + countChildren(item.location) + ')</th></tr>';
			}

			html +=
				'<tr>' +
					// '<td class="location">' + _html(item.location) + '</td>' +
					'<td class="title"><input data-name="title.' + item.id + '" value="' + _html(item.title) + '" /></td>' +
					'<td class="url"><input data-name="url.' + item.id + '" value="' + _html(item.url) + '" /></td>' +
				'</tr>';
		}
		table.innerHTML = html;

		document.body.classList.remove('loading');

		console.timeEnd('init');
	});
}

window.onload = init;
