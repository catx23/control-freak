<?php


?>

<!DOCTYPE html>
<!--[if lt IE 7]>       <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>          <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>          <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!-->  <html class="no-js" lang="en"> <!--<![endif]-->
<head>
    <title><?= $page['title']; ?> <?php if ($page['title'] != $params['title']) {
    echo '- ' . $params['title'];
} ?></title>
    <meta name="description" content="<?= $params['tagline']; ?>" />
    <meta name="author" content="<?= $params['author']; ?>">
    <meta charset="UTF-8">
    <link rel="icon" href="<?= $params['theme']['favicon']; ?>" type="image/x-icon">
    <!-- Mobile -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="<?= $base_url; ?>/ext/easyXDM.js"></script>

    <?php

        if($tree) {

            if(!function_exists('buildNavigation2')) {

                function buildNavigation2($tree, $path, $current_url, $base_page, $mode)
                {
                    $nav = [];
                    foreach ($tree->getEntries() as $node) {
                        $url = $node->getUri();
                        if ($node instanceof Todaymade\Daux\Tree\Content) {
                            if ($node->isIndex()) {
                                continue;
                            }

                            $link = ($path === '') ? $url : $path . '/' . $url;

                            $nav[] = [
                                'title' => $node->getTitle(),
                                'href' => $base_page . $link,
                                'class' => $current_url === $link ? 'Nav__item--active' : '',
                            ];
                        } elseif ($node instanceof Todaymade\Daux\Tree\Directory) {
                            if (!$node->hasContent()) {
                                continue;
                            }

                            $link = ($path === '') ? $url : $path . '/' . $url;

                            $folder = [
                                'title' => $node->getTitle(),
                                'class' => strpos($current_url, $link) === 0 ? 'Nav__item--open' : '',
                            ];

                            if ($index = $node->getIndexPage()) {
                                $folder['href'] = $base_page . $index->getUrl();
                            }

                            //Child pages
                            $new_path = ($path === '') ? $url : $path . '/' . $url;
                            $folder['children'] = buildNavigation2($node, $new_path, $current_url, $base_page, $mode);

                            if (!empty($folder['children'])) {
                                $folder['class'] .= ' has-children';
                            }

                            $nav[] = $folder;
                        }
                    }

                    return $nav;
                }
            }
            //$nav = buildNavigation($tree,'/','','','DAUX_LIVE');
            //print_r(json_encode($nav));
        }

    ?>

    <script type="text/javascript">

        var pixlrEditor = null;
        var xdmSocket = null;
        var editorImage=null;
        var imageUrl=null;
        var editorArgs=null;
        var saveUrl=null;
        var title='';
        var format = 'jpg';

        function urlDecode (string, overwrite) {
            if (!string || !string.length) {
                return{}
            }
            var obj = {};
            var pairs = string.split("&");
            var pair, name, value;
            for (var i = 0, len = pairs.length; i < len; i++) {
                pair = pairs[i].split("=");
                name = decodeURIComponent(pair[0]);
                value = decodeURIComponent(pair[1]);
                if(value!=null && value==='true'){
                    value=true;
                }else if(value==='false'){
                    value=false;
                }
                if (overwrite !== true) {
                    if (typeof obj[name] == "undefined") {
                        obj[name] = value
                    } else {
                        if (typeof obj[name] == "string") {
                            obj[name] = [obj[name]];
                            obj[name].push(value)
                        } else {
                            obj[name].push(value)
                        }
                    }
                } else {
                    obj[name] = value
                }
            }
            return obj;
        }


        function onMessage(message){

            var result  = JSON.parse(message);

            console.log('message :',message);
            if(result && result.command && result.command==='edit')
            {
                if(editorImage==null){
                    img_create(result.url,'','');
                }
                imageUrl = result.url;
                saveUrl = result.saveUrl;
                title = result.title;
                format = result.format;
            }
        }

        function sendMessage(message)
        {
            xdmSocket.postMessage(JSON.stringify(message));
        }

        function init (){

            return;
            var inUrl = '' + window.location.href;

            console.log('init url ' + inUrl);
            //http://localhost/projects/x4mm/Code/xapp/xcf/?debug=true&run=run-release-debug&protocols=true&xideve=true&drivers=true&plugins=false&xblox=debug&files=true&dijit=debug&xdocker=debug&xfile=debug&davinci=debug&dgrid=debug&xgrid=debug&xace=debug&wcDocker=debug
            if(!inUrl){
                console.error('invalid');
                //http://localhost/projects/x4mm/Code/xapp/xcf/?debug=true&run=run-release-debug&protocols=true&xideve=true&drivers=true&plugins=false&xblox=debug&files=true&dijit=debug&xdocker=debug&xfile=debug&davinci=debug&dgrid=debug&xgrid=debug&xace=debug&wcDocker=debug
            }

            var parameterString = '' ;

            function base64_decode (encodedData) {

                if (typeof window !== 'undefined') {
                    if (typeof window.atob !== 'undefined') {
                        return decodeURIComponent(escape(window.atob(encodedData)))
                    }
                } else {
                    return new Buffer(encodedData, 'base64').toString('utf-8')
                }

                var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
                var o1
                var o2
                var o3
                var h1
                var h2
                var h3
                var h4
                var bits
                var i = 0
                var ac = 0
                var dec = ''
                var tmpArr = []

                if (!encodedData) {
                    return encodedData
                }

                encodedData += ''

                do {
                    // unpack four hexets into three octets using index points in b64
                    h1 = b64.indexOf(encodedData.charAt(i++))
                    h2 = b64.indexOf(encodedData.charAt(i++))
                    h3 = b64.indexOf(encodedData.charAt(i++))
                    h4 = b64.indexOf(encodedData.charAt(i++))

                    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4

                    o1 = bits >> 16 & 0xff
                    o2 = bits >> 8 & 0xff
                    o3 = bits & 0xff

                    if (h3 === 64) {
                        tmpArr[ac++] = String.fromCharCode(o1)
                    } else if (h4 === 64) {
                        tmpArr[ac++] = String.fromCharCode(o1, o2)
                    } else {
                        tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
                    }
                } while (i < encodedData.length)

                dec = tmpArr.join('')

                return decodeURIComponent(escape(dec.replace(/\0+$/, '')))
            }

            function base64_encode(data) {

                // From: http://phpjs.org/functions
                // +   original by: Tyler Akins (http://rumkin.com)
                // +   improved by: Bayron Guevara
                // +   improved by: Thunder.m
                // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // +   bugfixed by: Pellentesque Malesuada
                // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // +   improved by: Rafał Kukawski (http://kukawski.pl)
                // *     example 1: base64_encode('Kevin van Zonneveld');
                // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
                // mozilla has this native
                // - but breaks in 2.0.0.12!
                //if (typeof this.window.btoa === 'function') {
                //    return btoa(data);
                //}
                var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                    ac = 0,
                    enc = '',
                    tmp_arr = [];

                if (!data) {
                    return data;
                }

                do { // pack three octets into four hexets
                    o1 = data.charCodeAt(i++);
                    o2 = data.charCodeAt(i++);
                    o3 = data.charCodeAt(i++);

                    bits = o1 << 16 | o2 << 8 | o3;

                    h1 = bits >> 18 & 0x3f;
                    h2 = bits >> 12 & 0x3f;
                    h3 = bits >> 6 & 0x3f;
                    h4 = bits & 0x3f;

                    // use hexets to index into b64, and append result to encoded string
                    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                } while (i < data.length);

                enc = tmp_arr.join('');

                var r = data.length % 3;

                return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

            }

            if(inUrl.lastIndexOf('?')){

                parameterString = inUrl.substring(inUrl.lastIndexOf('?')+1,inUrl.length);
                var urlParameters=urlDecode(parameterString);

                var target =urlParameters.xdmTarget;

                if(!target || target && target=='undefined'){
                    return;
                }

                if(target.indexOf('http:')==-1){
                    target = base64_decode(target);
                }

                target=decodeURIComponent(target);
                //http://localhost/projects/x4mm/Control-Freak-Documentation/daux/Getting_Started?xdmTarget=http%3A%2F%2Flocalhost%2Fprojects%2Fx4mm%2FCode%2Fxapp%2Fxcf%2F%3Fdebug%3Dtrue%26run%3Drun-release-debug%26protocols%3Dtrue%26xideve%3Dtrue%26drivers%3Dtrue%26plugins%3Dfalse%26xblox%3Ddebug%26files%3Dtrue%26dijit%3Ddebug%26xdocker%3Ddebug%26xfile%3Ddebug%26davinci%3Ddebug%26dgrid%3Ddebug%26xgrid%3Ddebug%26xace%3Ddebug%26wcDocker%3Ddebug&xdm_e=http%3A%2F%2Flocalhost%2Fprojects%2Fx4mm%2FCode%2Fxapp%2Fxcf%2F&xdm_c=default9743&xdm_p=4
                //console.error('creating socket to '+target);
                xdmSocket = new easyXDM.Socket({
                    remote: "" + target,
                    onMessage:function (message, origin)
                    {
                        onMessage(message);
                    }
                });

                //console.error('xdmtarge = ' + target);

                //var newUrl = + encodeURIComponent('' + window.location.href);

                if(target && target!=='undefined' && target.length) {
                    $(function () {
                        $('a').each(function () {
                            var cUrl = $(this).attr('href');
                            var bindStr = '?';
                            if (cUrl && cUrl.indexOf('xdmTarget') == -1) {
                                if (cUrl.indexOf('?') != -1) {
                                    bindStr = '&';
                                }
                                var newUrl = cUrl + bindStr + 'xdmTarget=' + base64_encode(target);
                                //console.log('new url ' + newUrl);
                                //$(this).attr('href', newUrl);
                            }


                        });
                    });
                }

            }
        }

        document.onreadystatechange = function () {

            if(typeof easyXDM !=='undefined') {

                var state = document.readyState;
                if (state == 'interactive') {
                } else if (state == 'complete') {
                    init();
                }
            }else{
                console.error('easy xdm not defined');
            }

        }

    </script>





    <!-- Font -->
    <?php foreach ($params['theme']['fonts'] as $font) {
    echo "<link href='$font' rel='stylesheet' type='text/css'>";
} ?>

    <!-- CSS -->
    <?php foreach ($params['theme']['css'] as $css) {
    echo "<link href='$css' rel='stylesheet' type='text/css'>";
} ?>

    <?php if ($params['html']['search']) {
    ?>
        <!-- Tipue Search -->
        <link href="<?= $base_url; ?>tipuesearch/tipuesearch.css" rel="stylesheet">
    <?php

} ?>

    <!--[if lt IE 9]>
    <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>
<body class="<?= $params['html']['float'] ? 'with-float' : ''; ?> xTheme xTheme-white">
    <?= $this->section('content'); ?>

    <?php
    if ($params['html']['google_analytics']) {
        $this->insert('theme::partials/google_analytics', ['analytics' => $params['html']['google_analytics'], 'host' => array_key_exists('host', $params) ? $params['host'] : '']);
    }
    if ($params['html']['piwik_analytics']) {
        $this->insert('theme::partials/piwik_analytics', ['url' => $params['html']['piwik_analytics'], 'id' => $params['html']['piwik_analytics_id']]);
    }
    ?>

    <!-- jQuery -->
    <script src="<?= $base_url; ?>themes/daux/js/jquery-1.11.3.min.js"></script>

    <!-- hightlight.js -->
    <script src="<?= $base_url; ?>themes/daux/js/highlight.pack.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>

    <!-- JS -->
    <?php foreach ($params['theme']['js'] as $js) {
        echo '<script src="' . $js . '"></script>';
    } ?>

    <script src="<?= $base_url; ?>themes/daux/js/daux.js"></script>

    <?php if ($params['html']['search']) {
        ?>
        <!-- Tipue Search -->
        <script type="text/javascript" src="<?php echo $base_url; ?>tipuesearch/tipuesearch.js"></script>

        <script>
            window.onunload = function(){}; // force $(document).ready to be called on back/forward navigation in firefox
            $(function() {
                tipuesearch({
                    'base_url': '<?php echo $base_url?>'
                });
            });
        </script>
    <?php

    } ?>

</body>
</html>
