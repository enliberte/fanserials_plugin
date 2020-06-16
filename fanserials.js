(function(plugin) {
    var PREFIX = plugin.getDescriptor().id;
    var TITLE = plugin.getDescriptor().title;
    var LOGO = plugin.path + "logo.png";
    var service = require("showtime/service");
    var http = require("./http");
    var START_PAGE_URI = PREFIX + ":start";
    var SHOWS_PAGE_URI = PREFIX + ":shows";
    var offset = 0;

    service.create(TITLE, PREFIX + ":start", "video", true, LOGO);
    var store = plugin.createStore("config", true);
    store.showMoreButton = true;

    plugin.addURI(START_PAGE_URI, start);
    plugin.addURI(SHOWS_PAGE_URI, shows);

    function start(page) {
        page.loading = true;
        page.metadata.logo = LOGO;
        page.metadata.title = TITLE;
        //page.type = "directory";
        //page.metadata.glwview = plugin.path + "views/main.view";
        buildGetBaseUrlPage(page);
        page.loading = false;
    }

    function buildGetBaseUrlPage(page) {
        var dialog = showtime.textDialog("Введите адрес сайта", true, false);
        store.url = dialog.input;
        page.redirect(SHOWS_PAGE_URI);
    }

    function shows(page) {
        page.loading = true;
        page.metadata.logo = LOGO;
        page.metadata.title = TITLE;
        page.type = "directory";
        appendShows(page, {offset: offset});
    }

    function appendShows(page, query) {
        var showsList = getShows(query);
        if (showsList && showsList.length !== 0) {
            showsList.forEach(function (show) {
                page.appendItem(show.url, 'directory', {description: show.name})
            });
            page.appendAction("Еще...", appendShows);
        }
    }

    function getShows(query) {
        var response = http.request(store.url + "api/v1/serials?offset=" + query.offset, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0.2 Safari/604.4.7',
            }
        });
        offset+=20;
        return showtime.JSONDecode(response.toString()).data;
    }
})(this);
