import React, { useEffect, useState } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

    function long2tile(lon,zoom1) { 
        var tt = Number(lon);
        return (Math.floor((tt+180)/360*Math.pow(2,zoom1)));
    }
    
    function lat2tile(lat,zoom2)  { 
        return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom2))); 
    }
    

    var mapObj;

    const popup = new mapboxgl.Popup({
        // closeButton: false,
        // closeOnClick: false
    });

function Map() {

    useEffect(() => {
        
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3VubnlzYW53YXIiLCJhIjoiY2wwNjV5N3kzMDQwbTNib2NhMnd6NGg2dCJ9.501q9aEzAkIe4RzQm-IzQg';
        const map = mapObj =  new mapboxgl.Map({
            container: 'map-container', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [-71.09045761980153, 42.36298977290063],//[ -74.00618746876717, 40.71363155423475], // starting position [lng, lat]
            zoom: 15, // starting zoom
            pitch: 45,
            bearing: 45,
            antialias: true
        });
        map.on('load', function() {

            map.on('moveend', async function (e) {
                loadBuildingsDataUpdateLayer();
            });

            
            
            loadBuildingsDataInLayer();

            //set up data sources
            map.addSource('rhodeisland-source', {
                'type': 'vector',
                'url': 'mapbox://sunnysanwar.80in7wv8'
            });

            map.addLayer({
                'id': 'rhodeisland-layer',
                'type': 'fill',
                'source': 'rhodeisland-source',
                'source-layer': 'Massachusetts',
                'paint': {
                    'fill-outline-color': 'rgba(199,24,54,0)',
                    'fill-color': '#807780',
                    'fill-opacity': 1,
                },
            });

            map.addSource('3d-buildings-1', {
                'type': 'geojson',
                'data': null
            });
            map.addLayer({
                'id': '3d-buildings-1',
                'type': 'fill-extrusion',
                'source': '3d-buildings-1',
                'zindex':2,
                'paint': {
                    'fill-extrusion-color':[
                        'interpolate',
                        ['linear'],
                        ["to-number", ["get", "height"]],
                        10, '#F2F12D',
                         20, '#EED322',
                         30, '#E6B71E',
                        50, '#FF4D27'
                    ],
                    'fill-extrusion-height': ["to-number", ["get", "height"]],
                    'fill-extrusion-opacity': 1
                }
            });
            // const layers = map.getStyle().layers;
            // const labelLayerId = layers.find(
            //   (layer) => layer.type === 'symbol' && layer.layout['text-field']
            // ).id;
            // map.addSource('data-buildings', {
            //   type: 'geojson',
            //   data: './data.geojson'
            // })
      
            // // map.addLayer(
            // //   {
            // //     'id': 'add-buildings-without-height',
            // //     'source': 'data-buildings',
            // //     'filter': ['has', 'building:levels'],
            // //     'type': 'fill-extrusion',
            // //     'minzoom': 15,
            // //     'paint': {
            // //       'fill-extrusion-color': '#aaa',
            // //       'fill-extrusion-height': ["*", 3, ["to-number", ["get", "building:levels"]]],
            // //     }
            // //   },
            // //   labelLayerId
            // // );
      
            // map.addLayer(
            //   {
            //     'id': 'add-buildings-with-height',
            //     'source': 'data-buildings',
            //     'filter': ['has', 'height'],
            //     'type': 'fill-extrusion',
            //     // 'minzoom': 15,
            //     'paint': {
            //       'fill-extrusion-color':[
            //         'interpolate',
            //         ['linear'],
            //         ["to-number", ["get", "height"]],
            //         10, '#F2F12D',
            //          20, '#EED322',
            //          30, '#E6B71E',
            //         50, '#FF4D27'
            //     ],
            //     'fill-extrusion-height': ["to-number", ["get", "height"]],
            //     'fill-extrusion-opacity': 0.7
            //     }
            //   },
            //   labelLayerId
            // );

            // const popup = new mapboxgl.Popup({
            //     closeButton: false,
            //     closeOnClick: false
            // });
            // map.on('click', 'add-buildings-with-height', async function(e) {
            //     var feature = e.features[0];
            //     const { _x,  _y } = feature;
            //     var res = await axios.get(`https://data.osmbuildings.org/8.0/anonymous/tile/15/${_x}/${_y}.json`);
            //     console.log(res.data, "data");
            //     setTimeout(() => {
            //         map.removeSource('data-buildings')
            //         map.removeLayer('add-buildings-with-height')
    
            //         map.addSource('data-buildings-1', {
            //             type: 'geojson',
            //             data: res.data
            //         })
    
            //         map.addLayer({
            //             'id': 'add-buildings-with-height-1',
            //             'source': 'data-buildings',
            //             'filter': ['has', 'height'],
            //             'type': 'fill-extrusion',
            //             // 'minzoom': 15,
            //             'paint': {
            //             'fill-extrusion-color': ['coalesce', ['get', 'height'], '#FF2727'],
            //             'fill-extrusion-height': ["to-number", ["get", "height"]],
            //             'fill-extrusion-opacity': 0.7
            //             }
            //         });
            //     }, 3000);
            //     return;
            //     //popup
            //     const coordinates = e.lngLat;
            //     const prop = feature.properties;
            //     var description = `<p>id: ${prop.id}</p>
            //     <p>osm id: ${prop.osm_id}</p>`;
            //     if(prop['name'] !== undefined )
            //     description += `<p>name: ${prop['name']}</p>`;
            //     if(prop['addr:housenumber'] !== undefined )
            //     description += `<p>house number: ${prop['addr:housenumber']}</p>`;
            //     if(prop['addr:postcode'] !== undefined )
            //     description += `<p>post code: ${prop['addr:postcode']}</p>`;
            //     if(prop['addr:street'] !== undefined )
            //     description += `<p>street: ${prop['addr:street']}</p>`;
            //     if(prop['addr:city'] !== undefined )
            //     description += `<p>city: ${prop['addr:city']}</p>`;
            //     if(prop['addr:state'] !== undefined )
            //     description += `<p>state: ${prop['addr:state']}</p>`;
            //     if(prop.height !== undefined )
            //     description += `<p>height: ${prop.height}</p>`;
            //     if(prop.start_date !== undefined )
            //     description += `<p>start date: ${prop.start_date}</p>`;

            //     popup.setLngLat(coordinates).setHTML(description).addTo(map);
            // });


            
            // map.on('mousemove', 'add-buildings-with-height', function(e) {
                
            //     const bbox = [
            //         [e.point.x - 5, e.point.y - 5],
            //         [e.point.x + 5, e.point.y + 5]
            //     ];
                
            //     var feature = e.features[0];
            //     const { osm_id } = feature.properties;
            //     const featuresList = map.queryRenderedFeatures(bbox, {
            //         layers: ['add-buildings-with-height']
            //     });
            //     var num_a, features_arr = [];
            //     featuresList.map((fe) => {
            //         num_a = fe.properties.osm_id;
            //         if(num_a === osm_id ){
            //             features_arr.push({
            //                 "type": "Feature",
            //                 "properties": { ...fe.properties },
            //                 "geometry": { ...fe.geometry }
            //             });
            //         }
            //     });

            //     var clickedFeatures = {
            //         "type": "FeatureCollection",
            //             "features": features_arr
            //     };

            //     map.getSource('3d-buildings-1').setData(clickedFeatures);

            // });
    
            // // Change it back to a pointer and reset opacity when it leaves.
            // map.on('mouseout', 'add-buildings-with-height', function(e) {
            //     popup.remove();
            //     map.getSource('3d-buildings-1').setData(null);
            // });
    });


    }, []);


    const loadBuildingsDataUpdateLayer = async () => {

        const { lat, lng } = mapObj.getCenter();
        var currenZoom = Math.trunc(mapObj.getZoom());
        var _x = long2tile(lng, currenZoom), _y = lat2tile(lat, currenZoom);
        var res = await axios.get(`https://data.osmbuildings.org/0.2/anonymous/tile/${currenZoom}/${_x}/${_y}.json`);
        if(res.status === 200){
            mapObj.getSource('data-buildings-1').setData(res.data);
        }

    } 

    const loadBuildingsDataInLayer = async () => {

        const { lat, lng } = mapObj.getCenter();
        var currenZoom = Math.trunc(mapObj.getZoom());
        var _x = long2tile(lng, currenZoom), _y = lat2tile(lat, currenZoom);

        var res = await axios.get(`https://data.osmbuildings.org/0.2/anonymous/tile/${currenZoom}/${_x}/${_y}.json`);
        // res.data.features.map((co)=> {
        //     console.log(co);
        // })
        if(res.status === 200){
            if(mapObj.getSource('data-buildings-1')){
                mapObj.removeLayer('add-buildings-with-height-1')
                mapObj.removeSource('data-buildings-1')
            }
    
            mapObj.addSource('data-buildings-1', {
                type: 'geojson',
                data: res.data
            })
    
            mapObj.addLayer({
                'id': 'add-buildings-with-height-1',
                'source': 'data-buildings-1',
                'filter': ['has', 'height'],
                'type': 'fill-extrusion',
                // 'minzoom': 15,
                'paint': {
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ["to-number", ["get", "height"]],
                    10, '#F2F12D',
                        20, '#EED322',
                        30, '#E6B71E',
                    50, '#FF4D27'
                ],
                'fill-extrusion-height': ["to-number", ["get", "height"]],
                'fill-extrusion-opacity': 0.7
                }
            });
            console.log("run")
            mapObj.on('click', 'add-buildings-with-height-1', function(e) {
                const bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5]
                ];
                var feature = e.features[0];
                const featuresList = mapObj.queryRenderedFeatures(bbox, {
                    layers: ['rhodeisland-layer']
                });
                console.log(feature, featuresList);

                // featuresList.map((fe) => {
                //     if(feature.id === fe.properties.GEOID)
                //         console.log(feature.id, fe.properties.GEOID);
                // });
                return;
                var prop;
                featuresList.map((fe) => {
                    if(feature.id === fe.properties.OSM_ID){
                        prop = fe.properties;
                        console.log(feature, fe);
                    }
                });
                const coordinates = e.lngLat;
                var description = `<p>name: ${prop.NAME}</p>
                <p>osm id: ${prop.OSM_ID}</p>`;
                if(prop['HOUSENUMBE'] !== undefined )
                description += `<p>house number: ${prop['HOUSENUMBE']}</p>`;
                if(prop['addr:housenumber'] !== undefined )
                description += `<p>house number: ${prop['addr:housenumber']}</p>`;
                if(prop['POSTALCODE'] !== undefined )
                description += `<p>post code: ${prop['POSTALCODE']}</p>`;
                if(prop['STREET'] !== undefined )
                description += `<p>street: ${prop['STREET']}</p>`;
                if(prop.COUNTY !== undefined )
                description += `<p>county: ${prop.COUNTY}</p>`;
                if(prop['REGION'] !== undefined )
                description += `<p>region: ${prop['REGION']}</p>`;
                if(prop['COUNTRY'] !== undefined )
                description += `<p>country: ${prop['COUNTRY']}</p>`;
                if(prop.BUIDING !== undefined )
                description += `<p>Building: ${prop.BUIDING}</p>`;
                popup.setLngLat(coordinates).setHTML(description).addTo(mapObj);
            });

            mapObj.on('mousemove', 'add-buildings-with-height-1', function(e) {             
                const bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5]
                ];
                var feature = e.features[0];
                const featuresList = mapObj.queryRenderedFeatures(bbox, {
                    layers: ['rhodeisland-layer']
                });
                var num_a, features_arr = [];
                featuresList.map((fe) => {
                    num_a = fe.properties.OSM_ID;
                    if(num_a === feature.id ){
                        features_arr.push({
                            "type": "Feature",
                            "properties": { ...fe.properties },
                            "geometry": { ...fe.geometry }
                        });
                    }
                });

                var clickedFeatures = {
                    "type": "FeatureCollection",
                        "features": features_arr
                };

                mapObj.getSource('3d-buildings-1').setData(clickedFeatures);

            });
    
            // Change it back to a pointer and reset opacity when it leaves.
            mapObj.on('mouseout', 'add-buildings-with-height-1', function(e) {
                // popup.remove();
                mapObj.getSource('3d-buildings-1').setData(null);
            });
        }

    } 
    
    return (
        <div>
        <div id='map-container' className="map-container" />
        </div>
    )
}

export default Map;