(function () {
    const VIDEOS = ["car", "chinanago", "chotto", "cool", "laugh", "luggage",
        "stretching", "tarmac", "training", "want", "winner"];
    const DEFAULT_VIDEO = "out";
    let videoCache = {};
    let hoveringVideo = false;
    let videoLastTime = 0;
    let hoverVideoTimer = null;

    window.addEventListener("load", init);

    function init() {
        for (let i = 0; i < VIDEOS.length; i++) {
            preloadVideo(VIDEOS[i]);
        }
        preloadVideo(DEFAULT_VIDEO);

        document.getElementById("video").addEventListener("mouseover", videoHover);
        document.getElementById("video").addEventListener("mouseleave", videoHoverStop);
    }

    function videoHover() {
        hoveringVideo = true;
        clearTimeout(hoverVideoTimer);
        hoverVideoTimer = setTimeout(startVideo, 1000);
    }

    function videoHoverStop() {
        if (!hoveringVideo) {
            return;
        }
        hoveringVideo = false;
        document.getElementById("video").querySelector("source").src = videoCache[DEFAULT_VIDEO];
        document.getElementById("video").load();
        document.getElementById("video").currentTime = videoLastTime;
    }

    function startVideo() {
        if (!hoveringVideo) {
            return;
        }

        let video = VIDEOS[Math.floor(Math.random()*VIDEOS.length)];
        videoLastTime = document.getElementById("video").currentTime;
        document.getElementById("video").querySelector("source").src = videoCache[video];
        document.getElementById("video").load();
    }

    function getVideoURL(video) {
        return "static/webm/" + video + ".webm";
    }

    function preloadVideo(video) {
        let req = new XMLHttpRequest();
        req.open("GET", getVideoURL(video), true);
        req.responseType = "blob";

        req.onload = function() {
            // Onload is triggered even on 404
            // so we need to check the status code
            if (this.status === 200) {
                let videoBlob = this.response;
                let vid = URL.createObjectURL(videoBlob); // IE10+
                // Video is now downloaded
                // and we can set it as source on the video element
                videoCache[video] = vid;
            }
        }
        req.send();
    }


})();