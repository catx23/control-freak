
1. In the view's template, it runs requirejs-domready/domReady
2. bootx(delegate=null)
3. bootx->require(xapp/boot)
3.1 xapp/boot->load
3.2 xapp/boot->start(settings)
3.3 xapp/boot->start : delite/register->parse
4. xapp/boot->start : construct managers, init managers
5. xapp/manager/Application->start
6. startx
7. xapp/manager/Context:init
    
    From here we have to load the scenes blox files!
    

Shared objects from IDE:
the IDE shares objects in onContextReady:
 
//hard wire file manager to IDE file manager
appContext.fileManager = this.ctx.fileManager;
 
//hard wire resource manager to IDE resource manager
appContext.resourceManager = this.ctx.resourceManager;

8. xapp/manager/Context:onReady
8.1 load/construct/init: filemanager, resourcemanager, blockManager


