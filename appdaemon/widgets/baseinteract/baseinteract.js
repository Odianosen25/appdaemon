function baseinteract(widget_id, url, skin, parameters)
{
    self = this

     // Initialization

    self.parameters = parameters;
    self.OnEvent = OnEvent;

    if ("mouse_events" in parameters){
        var actions = parameters.mouse_events.join(" ");
        
    }

    else {
        var actions = "click";
    }

    // get the mouse entity

    var callbacks = [
        {"selector": "img", "action": actions, "event" : true, "callback": OnEvent},
    ];

    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate

    // First check there is an entity, and if there is setup callback

    if ("entity" in parameters){
        var monitored_entities =
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
        ];

    }

    else var monitored_entities = []

     
    // Call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Set the url

    self.index = 0;
    refresh_frame(self)
    self.timeout = undefined

    function OnEvent(event)
    {
        
        var args = {};
        args["service"] = "event/fire";
        args["event"] = event.type;
        args["x_pos"] = event.pageX;
        args["y_pos"] = event.pageY;
        args["key_press"] = event.which;
        args["timestamp"] = event.timeStamp;
        args["widget_id"] = widget_id;

        self.call_service(self, args)

        //console.log(event);

    }

    function refresh_frame(self, url)
    {
        if (url === undefined){ 

            if ("base_url" in self.parameters && "access_token" in self) {
                var endpoint = '/api/camera_proxy/'
                if ('stream' in self.parameters && self.parameters.stream) {
                    endpoint = '/api/camera_proxy_stream/'
                }

                url = self.parameters.base_url + endpoint + self.parameters.entity + '?token=' + self.access_token
            }

            else if ("url" in self.parameters){

                url = self.parameters.url;
            }

            else
            {
                url = '/images/Blank.gif'
            }
        
        }

        if (url.indexOf('?') > -1)
        {
            url = url + "&time=" + Math.floor((new Date).getTime()/1000);
        }
        else
        {
            url = url + "?time=" + Math.floor((new Date).getTime()/1000);
        }

        self.set_field(self, "img_src", url);
        self.index = 0

        var refresh = 10
         if ('stream' in self.parameters && self.parameters.stream == "on") {
            refresh = 0
        }
        if ("refresh" in self.parameters)
        {
            refresh = self.parameters.refresh
        }

        if (refresh > 0)
        {
            clearTimeout(self.timeout)
            self.timeout = setTimeout(function() {refresh_frame(self, url)}, refresh * 1000);
        }

     }

     // Function Definitions

     // The StateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

     function OnStateAvailable(self, state)
    {
        self.state = state.state;

        if ("base_url" in self.parameters && "access_token" in self){
            self.access_token = state.attributes.access_token
            refresh_frame(self)
        }

        else { // mostlikely the url is in the state

            refresh_frame(self, state.state)
        }
        
    }

     // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter

     function OnStateUpdate(self, state)
    {
        self.state = state.state;

        if ("base_url" in self.parameters && "access_token" in self){
            self.access_token = state.attributes.access_token
            refresh_frame(self)
        }

        else { // mostlikely the url is in the state

            refresh_frame(self, state.state)
        }
    }

 }
