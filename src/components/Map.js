import React, { useEffect, useState } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;


function Map() {
    useEffect(() => {
        
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3VubnlzYW53YXIiLCJhIjoiY2wwNjV5N3kzMDQwbTNib2NhMnd6NGg2dCJ9.501q9aEzAkIe4RzQm-IzQg';
        const map = new mapboxgl.Map({
            container: 'map-container', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [ -74.00618746876717, 40.71363155423475], // starting position [lng, lat]
            zoom: 16, // starting zoom
            pitch: 65,
            bearing: 45,
            antialias: true
        });
        map.on('load', function() {

            map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                // 'minzoom': 15,
                'zindex':1,
                'paint': {
                    // 'fill-extrusion-color': '#aaa',
                    'fill-extrusion-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'height'],
                        10, '#F2F12D',
                         25, '#EED322',
                         50, '#E6B71E',
                        100, '#FF4D27'
                    ],
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    },
                    'fill-extrusion-base': {
                        'type': 'identity',
                        'property': 'min_height'
                    },
                    'fill-extrusion-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.5,
                        1
                    ]
                }
            });
            
            // setTimeout(() => {
            //     const featuresList = map.queryRenderedFeatures({
                //             layers: ['3d-buildings']
                //         });
 
                //         var num_arr = [];
                //         featuresList.map((fe) => {
            //             num_arr.push({...fe.properties, id: fe.id})
            //         });
            //         console.log(num_arr);
            
            //         // var num_arr = [], num_a;
            //         // featuresList.map((fe) => {
            //         //     num_a = fe.properties.height;
            //         //     if(!num_arr.includes(num_a))
            //         //         num_arr.push(num_a)
            //         // });
            //         // console.log(num_arr);

            // }, 5000);
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
            map.on('click', '3d-buildings', async function(e) {
                var feature = e.features[0];
                const { id } = feature;
                //popup
                const coordinates = e.lngLat;
                const prop = feature.properties;
                const res = await axios.get(`./php-api/building-data.php?id=${id}`);
                // console.log(res.data, "data");
                if(res.data.status === '0')
                return;
                const description = `<p>geo id: ${res.data.building_info.geo_id}</p>
                <p>height: ${prop.height}</p>
                <p>sqr. ft: ${res.data.building_info.sqr_ft}</p>
                <p>price: ${res.data.building_info.price}</p>`;

                popup.setLngLat(coordinates).setHTML(description).addTo(map);
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
                    'fill-extrusion-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'height'],
                        10, '#F2F12D',
                         25, '#EED322',
                         50, '#E6B71E',
                        100, '#FF4D27'
                    ],
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    },
                    'fill-extrusion-base': {
                        'type': 'identity',
                        'property': 'min_height'
                    },
                    'fill-extrusion-opacity': 0.9
                }
            });

            map.on('mousemove', '3d-buildings', function(e) {
                
                
                var feature = e.features[0];
                const { id } = feature;
                if(id === null)
                return
                const featuresList = map.queryRenderedFeatures({
                    layers: ['3d-buildings']
                });
                var num_a, features_arr = [];
                featuresList.map((fe) => {
                    num_a = fe.id;
                    if(num_a === id ){
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

                map.getSource('3d-buildings-1').setData(clickedFeatures);


            });
    
            // Change it back to a pointer and reset opacity when it leaves.
            map.on('mouseout', '3d-buildings', function(e) {
                popup.remove();
                map.getSource('3d-buildings-1').setData(null);
            });
    });


    }, [])
    
    return (
        <div>
        <div id='map-container' className="map-container" />
        </div>
    )
}

export default Map;