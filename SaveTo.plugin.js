//META{"name":"SaveTo"}*//

class SaveTo {
	
	constructor() {

		this.defaultData = {
            folders : new Array()
        };
        this.data;

        this.defaultSettings = {
            fileNameType : "original",
            sortMode : "a-z"
        };
        this.settings;

        this.classes;
        this.selectedFolder = -1;

	}
	
    getName() { return "Save To"; }
    getDescription() { return "Allows you to save images, videos, files, server icons and user avatars to your defined folders, or browse to a folder, via the context menu."; }
    getVersion() { return "0.1.2"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
            "0.1.2" : 
            `
                Added sort mode settings, including custom sorting.
                You can now add, remove and modify folders via the settings menu.
            `
		};
    }
    
    getSettingsPanel() {

        setTimeout(() => {

            var date = new Date();

            var refreshFolders = () => {

                var fields = new Array();

                for(let i = 0; i < this.data.folders.length; i++) {

                    var textField = Metalloriff.Settings.Elements.createTextField("", "text", this.data.folders[i].path, e => {
                        var name = e.target.value.substring(e.target.value.split("\\").join("/").lastIndexOf("/") + 1, e.target.value.length);
                        if(e.target.value.trim().length == 0 || name.length == 0) {
                            this.data.folders.splice(i, 1);
                            e.target.parentElement.outerHTML = "";
                        } else {
                            this.data.folders[i].path = e.target.value;
                            this.data.folders[i].name = name;
                        }
                        refreshFolders();
                        PluginUtilities.saveData("SaveTo", "data", this.data);
                    }, "focusout", "5px");

                    textField.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createButton("Browse", e => {
                        $("#st-folder-upload").remove();
                        $(".app").append(`<input id="st-folder-upload" style="display:none;" type="file" webkitdirectory directory></input>`);
                        var fileBrowser = document.getElementById("st-folder-upload");
                        fileBrowser.click();
                        fileBrowser.addEventListener("change", () => {
                            e.target.parentElement.querySelector("input").value = fileBrowser.files[0].path;
                            this.data.folders[i].path = fileBrowser.files[0].path;
                            this.data.folders[i].name = fileBrowser.files[0].path.substring(fileBrowser.files[0].path.split("\\").join("/").lastIndexOf("/") + 1, fileBrowser.files[0].path.length);
                            $("#st-folder-upload").remove();
                        });
                        refreshFolders();
                        PluginUtilities.saveData("SaveTo", "data", this.data);
                    }, "float:right;"));

                    var positionField = Metalloriff.Settings.Elements.createTextField("", "number", this.data.folders[i].position, e => {
                        if(e.target.value.length == 0) e.target.value = this.data.folders[i].position;
                        else this.data.folders[i].position = e.target.value;
                        refreshFolders();
                        PluginUtilities.saveData("SaveTo", "data", this.data);
                    }, "focusout", "", { withParent : false }).querySelector("input");

                    positionField.style.paddingRight = "10px";
                    positionField.style.width = "100px";
                    positionField.style.float = "left";

                    textField.setAttribute("data-path", this.data.folders[i].path);
                    textField.setAttribute("data-name", this.data.folders[i].name);
                    textField.setAttribute("data-priority", this.data.folders[i].position);

                    textField.querySelector("input").style.width = "430px";

                    textField.addEventListener("click", () => this.selectedFolder = i);

                    textField.insertAdjacentElement("afterbegin", positionField);

                    fields.push(textField);

                }

                if(this.settings.sortMode == "a-z" || this.settings.sortMode == "z-a") fields = fields.sort((x, y) => {
                    if(x.getAttribute("data-name").toLowerCase() < y.getAttribute("data-name").toLowerCase()) return -1;
                    if(x.getAttribute("data-name").toLowerCase() > y.getAttribute("data-name").toLowerCase()) return 1;
                    return 0;
                });

                if(this.settings.sortMode == "z-a" || this.settings.sortMode == "new-old") fields = fields.reverse();

                if(this.settings.sortMode == "custom") fields = fields.sort((x, y) => {
                    if(parseFloat(x.getAttribute("data-priority")) > parseFloat(y.getAttribute("data-priority"))) return -1;
                    if(parseFloat(x.getAttribute("data-priority")) < parseFloat(y.getAttribute("data-priority"))) return 1;
                    return 0;
                });

                document.getElementById("st-folders").innerHTML = "";

                for(let i = 0; i < fields.length; i++) document.getElementById("st-folders").insertAdjacentElement("beforeend", fields[i]);

            };

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createRadioGroup("st-file-name-type", "File name type:", [
                { title : "Original", value : "original", description : `Example: unknown.png` },
                { title : "Date", value : "date", description : `Example: ${date.toLocaleDateString().split("/").join("-")} ${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` },
                { title : "Random numbers", value : "random", description : `Example: ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` },
                { title : "Original + random numbers", value : "original+random", description : `Example: unknown ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` }
            ], this.settings.fileNameType, (e, choiceItem) => {
                this.settings.fileNameType = choiceItem.value;
                PluginUtilities.saveSettings("SaveTo", this.settings);
            }), this.getName());

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createRadioGroup("st-sort-type", "Sort by:", [
                { title : "A - Z", value : "a-z" },
                { title : "Z - A", value : "z-a" },
                { title : "Newest - Oldest", value : "new-old" },
                { title : "Oldest - Newest", value : "old-new" },
                { title : "By priority", value : "custom" }
            ], this.settings.sortMode, (e, choiceItem) => {
                this.settings.sortMode = choiceItem.value;
                refreshFolders();
                PluginUtilities.saveSettings("SaveTo", this.settings);
            }), this.getName());

            var folderLabels = document.createElement("div");

            folderLabels.insertAdjacentHTML("beforeend", `<h5 style="color:white;padding-bottom:10px;padding-top:20px;">Folders:</h5>`);
            folderLabels.insertAdjacentHTML("beforeend", `<h5 style="color:white;padding-bottom:10px;width:100px;display:inline-block;">Prioirty</h5>`);
            folderLabels.insertAdjacentHTML("beforeend", `<h5 style="color:white;padding-bottom:10px;width:430px;display:inline-block;">Path</h5>`);

            Metalloriff.Settings.pushElement(folderLabels, this.getName());

            var foldersParentDiv = document.createElement("div");

            foldersParentDiv.setAttribute("id", "st-folders");

            Metalloriff.Settings.pushElement(foldersParentDiv, this.getName());

            refreshFolders();

            Metalloriff.Settings.pushHTML(`<div id="st-settings-buttons" style="text-align:center;padding-top:20px;"></div>`, this.getName());

            var buttonParent = document.getElementById("st-settings-buttons");

            buttonParent.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createButton("Add Folder", () => {
                this.browseForFolder(() => refreshFolders());
            }));

            buttonParent.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createButton("Remove Selected Folder", () => {
                this.data.folders.splice(this.selectedFolder, 1);
                refreshFolders();
                PluginUtilities.saveData("SaveTo", "data", this.data);
            }, "margin-left:15px;", { id : "st-settings-remove-folder" }));

            buttonParent.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createButton("Open Selected Folder", () => {
                window.open(`file:///${this.data.folders[this.selectedFolder].path}`);
            }, "margin-left:15px;", { id : "st-settings-open-folder"}));

        }, 0);

        return `
        
            ${Metalloriff.Settings.Elements.pluginNameLabel(this.getName())}

            <div id="metalloriff-plugin-settings"></div>
        
        `;

    }

    load() {}

    start() {

		var libraryScript = document.getElementById('zeresLibraryScript');
		if (!libraryScript) {
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
			libraryScript.setAttribute("id", "zeresLibraryScript");
			document.head.appendChild(libraryScript);
		}
		if (typeof window.ZeresLibrary !== "undefined") this.initialize();
		else libraryScript.addEventListener("load", () => { this.initialize(); });

	}
	
	initialize() {

        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SaveTo.plugin.js");
        
        $("#NeatoBurritoLibrary").remove();

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
			lib.addEventListener("load", () => { this.onLibLoaded(); });
        } else { this.onLibLoaded(); }
        
        this.data = PluginUtilities.loadData("SaveTo", "data", this.defaultData);

        var updated = new Array();

        for(var i = 0; i < this.data.folders.length; i++) {

            if(typeof this.data.folders[i] !== "object") {

                var p = this.data.folders[i];

                updated.push( {
                    path : p,
                    name : p.substring(p.split("\\").join("/").lastIndexOf("/") + 1, p.length),
                    position : i
                });

            }

        }

        if(updated.length > 0) this.data.folders = updated;

        this.settings = PluginUtilities.loadSettings("SaveTo", this.defaultSettings);

	}

	onLibLoaded() {

        this.classes = Metalloriff.getClasses(["contextMenu", "member"]);
        
        $(document).on("contextmenu.SaveTo", e => {
            setTimeout(() => {
                this.onContextMenu(e);
            }, 0);
        });

        Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());

    }

    onContextMenu(e) {

        var member = $(e.target).parents(`.${this.classes.member}`), dm = $(e.target).parents(".channel.private, .friends-row"), messageGroup = $(e.target).parents(".message-group");

        if(e.target.localName != "a" && e.target.localName != "img" && e.target.localName != "video" && !member.length && !dm.length && !messageGroup.length) return;

        var saveLabel = "Save To", url = e.target.poster || e.target.style.backgroundImage.substring(e.target.style.backgroundImage.indexOf(`"`) + 1, e.target.style.backgroundImage.lastIndexOf(`"`)) || e.target.href || e.target.src, menu = new PluginContextMenu.Menu(false);

        if(e.target.classList.contains("avatar-small")) saveLabel = "Save Icon To";

        if(url == undefined || e.target.classList.contains("avatar-large")) {

            if(messageGroup.length) {

                var user = ReactUtilities.getOwnerInstance(messageGroup).props.messages[0].author;

                url = user.getAvatarURL();
                if(user.avatar.startsWith("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

            if(member.length) {

                var user = ReactUtilities.getOwnerInstance(member).props.user;

                url = user.getAvatarURL();
                if(user.avatar.startsWith("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

            if(dm.length) {

                var unparsedUrl = dm.find(".avatar-small")[0].style.backgroundImage;

                url = unparsedUrl.substring(unparsedUrl.indexOf(`"`) + 1, unparsedUrl.lastIndexOf(`"`));

                if(url.includes("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

        }

        if(url == undefined || e.target.classList.contains("emote") || url.includes("youtube.com/")) return;

        if(url.lastIndexOf("?") != -1) url = url.substring(0, url.lastIndexOf("?"));

        if(saveLabel.includes("Avatar") || saveLabel.includes("Icon")) url += "?size=2048";

        if(e.target.classList.contains("emoji")) saveLabel = "Save Emote To";

        url = url.replace(".webp", ".png");

        var fileName = url.substring(url.lastIndexOf("/") + 1, url.length), fileExtension = url.substring(url.lastIndexOf("."), url.length);
            
        var date = new Date();

        if(this.settings.fileNameType == "date") fileName = `${date.toLocaleDateString().split("/").join("-")} ${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;

        if(this.settings.fileNameType == "random") fileName = `${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;

        if(this.settings.fileNameType == "original+random") fileName = fileName.replace(fileExtension, "") + ` ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;
        
        var options = new PluginContextMenu.Menu(false);
        options.addItems(new PluginContextMenu.TextItem("Remove Folder", { callback : e => {
            this.data.folders.splice(this.data.folders.findIndex(x => x.name == e.currentTarget.parentElement.parentElement.innerText.split("\n")[0]), 1);
            PluginUtilities.saveData("SaveTo", "data", this.data);
            $(e.currentTarget.parentElement.parentElement).remove();
        }})).addItems(new PluginContextMenu.TextItem("Open Folder", { callback : e => {
            window.open("file:///" + this.data.folders.find(x => x.name == e.currentTarget.parentElement.parentElement.innerText.split("\n")[0]).path);
        }})).addItems(new PluginContextMenu.TextItem("Save To Folder", { callback : e => {
            e.target.parentElement.click();
        }}));

        var sorted = this.data.folders;

        if(this.settings.sortMode == "a-z" || this.settings.sortMode == "z-a") sorted = sorted.sort((x, y) => {
            if(x.name.toLowerCase() < y.name.toLowerCase()) return -1;
            if(x.name.toLowerCase() > y.name.toLowerCase()) return 1;
            return 0;
        });

        if(this.settings.sortMode == "z-a" || this.settings.sortMode == "old-new") sorted = sorted.reverse();

        if(this.settings.sortMode == "custom") sorted = sorted.sort((x, y) => {
            if(x.position > y.position) return -1;
            if(x.position < y.position) return 1;
            return 0;
        });

        for(let i = 0; i < this.data.folders.length; i++) {;
            menu.addItems(new PluginContextMenu.SubMenuItem(this.data.folders[i].name, options, { callback : e => {
                Metalloriff.downloadFile(url, this.data.folders[i].path, fileName);
            }}));
        }

        menu.addItems(new PluginContextMenu.ItemGroup().addItems(new PluginContextMenu.TextItem("Add Folder", { callback : () => {
            this.browseForFolder();
        }})).addItems(new PluginContextMenu.TextItem("Browse", { callback : () => {
            $("#st-folder-upload").remove();
            $(".app").append(`<input id="st-folder-upload" style="display:none;" type="file" webkitdirectory directory></input>`);
            var fileBrowser = document.getElementById("st-folder-upload");
            fileBrowser.click();
            fileBrowser.addEventListener("change", () => {
                Metalloriff.downloadFile(url, fileBrowser.files[0].path, fileName);
                $("#st-folder-upload").remove();
            });
        }}))).addItems(new PluginContextMenu.ItemGroup().addItems(new PluginContextMenu.TextItem("Settings", { callback : () => {
            document.querySelector(`.${this.classes.contextMenu}`).style.display = "none";
            Metalloriff.Settings.showPluginSettings(this.getName());
        }})));

        var subMenu = new PluginContextMenu.SubMenuItem(saveLabel, menu);

        $(`.${this.classes.itemGroup}`).last().append(subMenu.element);

    }

    browseForFolder(selected) {
        
        $("#st-folder-upload").remove();

        $(".app").append(`<input id="st-folder-upload" style="display:none;" type="file" webkitdirectory directory></input>`);

        var fileBrowser = document.getElementById("st-folder-upload");

        fileBrowser.click();

        fileBrowser.addEventListener("change", () => {

            var p = fileBrowser.files[0].path;

            if(this.data.folders.findIndex(x => x.path == p) == -1) {

                this.data.folders.push({
                    path : p,
                    name : p.substring(p.split("\\").join("/").lastIndexOf("/") + 1, p.length),
                    position : this.data.folders.length
                });

                PluginUtilities.saveData("SaveTo", "data", this.data);

            }

            $("#st-folder-upload").remove();

            if(selected != undefined) selected();

        });

    }
	
    stop() {

        $(document).off("contextmenu.SaveTo");

	}
	
}
