(function () {
    const VIDEOS = ["car", "chinanago", "chotto", "cool", "laugh", "luggage",
        "stretching", "tarmac", "training", "want", "winner"];
    const DEFAULT_VIDEO = "out";
    let videoCache = {};
    let hoveringVideo = false;
    let videoLastTime = 0;
    let hoverVideoTimer = null;
    let loadingNewTweets = false;
    let totalTweets = 0;
    let tweetsOnScreen = 0;
    let tweets = [];
    let tweetPosition = 0;

    window.addEventListener("load", init);

    function init() {
        for (let i = 0; i < VIDEOS.length; i++) {
            preloadVideo(VIDEOS[i]);
        }
        preloadVideo(DEFAULT_VIDEO);

        document.getElementById("video").addEventListener("mouseover", videoHover);
        document.getElementById("video").addEventListener("mouseleave", videoHoverStop);
        window.addEventListener("scroll", handleScroll);

        getTweets();
    }

    function videoHover() {
        hoveringVideo = true;
        clearTimeout(hoverVideoTimer);
        hoverVideoTimer = setTimeout(startVideo, 500);
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

    function elementInViewport(el) {
        let top = el.offsetTop;
        let left = el.offsetLeft;
        let width = el.offsetWidth;
        let height = el.offsetHeight;
      
        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }
      
        return (
            top >= window.pageYOffset &&
            left >= window.pageXOffset &&
            (top + height) <= (window.pageYOffset + window.innerHeight) &&
            (left + width) <= (window.pageXOffset + window.innerWidth)
        );
    }

    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
        
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    function getTweets() {
        fetch("static/tweets.txt")
            .then(loadTweets);
    }

    async function loadTweets(response) {
        let responseTweets = await response.text();
        let tweetIds = responseTweets.trim().split(/\r?\n/);
        let featured = [];
        for (let i = 0; i < 3; i++) {
            featured.push(tweetIds.shift());
        }
        shuffle(tweetIds);
        shuffle(featured);
        while (featured.length) {
            tweetIds.splice(Math.floor(Math.random() * 25), 0, featured.pop());
        }
        tweets = tweetIds;
    }

    function handleScroll() {
        if (loadingNewTweets || tweets.length == 0 || !elementInViewport(document.getElementById("loading"))) {
            return;
        }
        loadingNewTweets = true;

        let end = Math.min(tweets.length, tweetPosition + 12);
        for (let i = tweetPosition; i < end; i++) {
            insertTweet(tweets[i]);
            totalTweets++;
            tweetPosition++;
        }
    }

    function insertTweet(tweetId) {
        let container = document.createElement("div");
        container.classList.add("temp");
        document.getElementById("tweets").appendChild(container);
        twttr.widgets.createTweet(
            tweetId,
            container,
            {
                theme: "light",
                dnt: true
            }
        ).then(function (el) {
            container.classList.remove("temp");
            tweetsOnScreen++;
            if (totalTweets == tweetsOnScreen) {
                loadingNewTweets = false;
                if (Math.random() < 0.5) {
                    document.getElementById("loading").src = "static/img/chisatomote.png";
                } else {
                    document.getElementById("loading").src = "static/img/takinamote.png";
                }
            }
        });
    }
})();