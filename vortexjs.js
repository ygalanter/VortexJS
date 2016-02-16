// options
var OPT = {
    IMG_URL: "/resources/images/",
    FONT_URL: "/resources/fonts/",
    NO_OF_FRAMES: 38,
    NEXT_DELAY: 70,
    ANIM_WIDTH: 124,
    ANIM_HEIGH: 124,
    TRIG_MAX_ANGLE: Math.PI * 2
}

//flags
var flag_showDigitalTime;
var flag_showBattery;
var flag_showDate;
var flag_showDow;
var flag_showSeconds;
var flag_disableVortexAnimation;
var flag_showBluetooth;


var is_vortex_animating = false;
var anim_timer
var frame_no;
var s_bitmap;

function open_config() {
    window.open("http://codecorner.galanter.net/pebble/vortex/vortex_config_2.html?return_to=" + encodeURIComponent(location.href + "?config=true&json="), "config", "width=350, height=600")
}

function save_config(json_string) {

    //getting settings
    var settings = JSON.parse(decodeURIComponent(json_string));

    //storing them
    flag_showDigitalTime = settings.showDigitalTime; localStorage.setItem("flag_showDigitalTime", flag_showDigitalTime);
    flag_showBattery = settings.showBattery; localStorage.setItem("flag_showBattery", flag_showBattery);
    flag_showDate = settings.showDate; localStorage.setItem("flag_showDate", flag_showDate);
    flag_showDow = settings.showDow; localStorage.setItem("flag_showDow", flag_showDow);
    flag_showSeconds = settings.showSeconds; localStorage.setItem("flag_showSeconds", flag_showSeconds);
    flag_disableVortexAnimation = settings.disableVortexAnimation; localStorage.setItem("flag_disableVortexAnimation", flag_disableVortexAnimation);
    flag_showBluetooth = settings.sshowBluetooth; localStorage.setItem("flag_showBluetooth", flag_showBluetooth);

    rocky.mark_dirty();

}


// function to handle animation timer
function timer_handler() {
    
    // Advance to the next frame in array
    if(frame_no < OPT.NO_OF_FRAMES) {
    
        s_bitmap = frames[frame_no];

        rocky.mark_dirty();
        frame_no++;

    } else {
        is_vortex_animating = false;
        clearInterval(anim_timer);
    }
}



// starts animatin sequence
function load_sequence(init_frame) { // passing starting animation frame
    is_vortex_animating = true;
    frame_no = init_frame; // setting initial animation frame
    anim_timer = setInterval(timer_handler, OPT.NEXT_DELAY); //starting animation
}


//loading flags initially
flag_showDigitalTime = localStorage.getItem("flag_showDigitalTime") === null ? '1' : localStorage.getItem("flag_showDigitalTime");
flag_showBattery = localStorage.getItem("flag_showBattery") === null ? '1' : localStorage.getItem("flag_showBattery");
flag_showDate = localStorage.getItem("flag_showDate") === null ? '1' : localStorage.getItem("flag_showDate");
flag_showDow = localStorage.getItem("flag_showDow") === null ? '1' : localStorage.getItem("flag_showDow");
flag_showSeconds = localStorage.getItem("flag_showSeconds") === null ? '1' : localStorage.getItem("flag_showSeconds");
flag_disableVortexAnimation = localStorage.getItem("flag_disableVortexAnimation") === null ? '0' : localStorage.getItem("flag_disableVortexAnimation");
flag_showBluetooth = localStorage.getItem("flag_showBluetooth") === null ? '1' : localStorage.getItem("flag_showBluetooth");


 var rocky = Rocky.bindCanvas(document.getElementById("pebble"));
 rocky.export_global_c_symbols();
 

 rocky.update_proc = function (ctx, bounds) {
     
     //background
     graphics_context_set_fill_color(ctx, GColorBlack);
     graphics_fill_rect(ctx, [0,0,bounds.w, bounds.h]);
     
     if (is_vortex_animating && s_bitmap) {
         graphics_draw_bitmap_in_rect(ctx, s_bitmap, [(bounds.w - OPT.ANIM_WIDTH) / 2, (bounds.h - OPT.ANIM_HEIGH) / 2, OPT.ANIM_WIDTH, OPT.ANIM_HEIGH]);
     } else {

         //time 
         var date = new Date;
         var tm_hour = date.getHours();
         var tm_min = date.getMinutes();
         var tm_sec = date.getSeconds();

         if (tm_sec == 0 && flag_disableVortexAnimation =='0') {
             load_sequence(0);
             return;
         }

         var radius = 53;
         var center = { x: bounds.w / 2, y: bounds.h / 2 };

         var currY;
         var currX;

         //outer circle
         graphics_context_set_stroke_color(ctx, GColorElectricUltramarine);
         graphics_context_set_stroke_width(ctx, 2);
         graphics_draw_circle(ctx, [center.x, center.y], radius-1);


         var hour_angle = (OPT.TRIG_MAX_ANGLE * (((tm_hour % 12) * 6) + (tm_min / 10))) / (12 * 6);
         var minute_angle = OPT.TRIG_MAX_ANGLE * tm_min / 60;
         var second_angle = OPT.TRIG_MAX_ANGLE * tm_sec / 60;

         // hour
         currY = -radius * Math.cos(hour_angle) + center.y;
         currX = radius * Math.sin(hour_angle)  + center.x;
         graphics_context_set_fill_color(ctx, GColorPurple); 
         graphics_fill_circle(ctx, GPoint(currX, currY), 11);
  
         // minute
         currY = -radius * Math.cos(minute_angle) + center.y;
         currX = radius * Math.sin(minute_angle) + center.x;
         graphics_context_set_fill_color(ctx, GColorCyan);
         graphics_fill_circle(ctx, GPoint(currX, currY), 8);
  
         // second
         if (flag_showSeconds == '1') {
             currY = -radius * Math.cos(second_angle) + center.y;
             currX = radius * Math.sin(second_angle) + center.x;
             graphics_context_set_fill_color(ctx, GColorWhite);
             graphics_fill_circle(ctx, GPoint(currX, currY), 5);
         }

         //digital time 
         if (flag_showDigitalTime == '1') {
             graphics_context_set_text_color(ctx, GColorMalachite);
             graphics_draw_text(ctx, moment().format("HH:mm"), makisupa_big, GRect(30, 67, 85, 40), GTextOverflowModeWordWrap, GTextAlignmentCenter);
         }

         //displaying digital date & dow
         graphics_context_set_text_color(ctx, GColorWhite);
         if (flag_showDate == '1') graphics_draw_text(ctx, moment().format("MMM D"), makisupa_small, GRect(72, 148, 69, 20), GTextOverflowModeWordWrap, GTextAlignmentRight);
         if (flag_showDow == '1') graphics_draw_text(ctx, moment().format("ddd"), makisupa_small, GRect(3, 148, 50, 20), GTextOverflowModeWordWrap, GTextAlignmentLeft);

     }
                 
     
 };

// loading animation frames
 var frames = [];
 for (i=0; i<38; i++){
     frames.push(
        gbitmap_create(location.href.substring(0, location.href.lastIndexOf("/")) + OPT.IMG_URL + 'frame_0' + (i < 10 ? '0' : '') + i + '~basalt.png')
     );
 }

//loading custom fonts
 var makisupa_big = fonts_load_custom_font({ height: 30, url: location.href.substring(0, location.href.lastIndexOf("/")) + OPT.FONT_URL + 'MAKISUPA.TTF' });
 var makisupa_small = fonts_load_custom_font({ height: 18, url: location.href.substring(0, location.href.lastIndexOf("/")) + OPT.FONT_URL + 'MAKISUPA.TTF' });
 
 setInterval(function () {
     rocky.mark_dirty();
 }, 1000);

 
