import React, { useState, useEffect, useRef } from "react";
import {currentTheme} from "assets/jss/material-dashboard-react.js";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

const styles = {
    canvas : {
        boxShadow: '0 0 2px #111',
        borderRadius: '250px'
    }
};

const useStyles = makeStyles(styles);

const Visualization = () => {
    const classes = useStyles();
    let ref = useRef();
    let size = 280;

    useEffect(()=>{
        size = ref.current.parentElement.clientWidth;
    }, [ref])

    useEffect(()=>{
        let c = ref.current;
        size = c.parentElement.clientWidth;
        var w = c.width = size,
		h = c.height = size,
		ctx = c.getContext( '2d' ),
        
		opts = {
			range: 200, //범위 - 숫자가 커지면 넓어짐
			baseConnections: 3, // 동그라미가 연결된 갯수 같은데 차이가 크게 없어요
			addedConnections: 5, // 숫자가 커지면 불꽃이 퍼지는 범위가 널벙짐
			baseSize: 5, //동그라미 크기
			minSize: 1, // 제일작은 동그라미의 크기 (ex) 1면 크기 1이상만 보여주기, 2면 2이상만
			dataToConnectionSize: .4, // 불꽃 크기 
			sizeMultiplier: .7, // 연결된 동그라미들의 범위, 숫자가 커질수록 넓어짐 (범위랑 비슷)
			allowedDist: 40, //숫자가 작아질수록 동그라미들의 밀도가 촘촘해지면서 많아짐
			baseDist: 40, 
			addedDist: 30,
			connectionAttempts: 100, // 연결되는 갯수같은데 차이가 크게 없음
			
			dataToConnections: 1,
			baseSpeed: .01, // 불꽃 튀기는 속도
			addedSpeed: .05, // 불꽃 튀기는 속도
			baseGlowSpeed: .4, 
			addedGlowSpeed: .4,
			rotVelX: .003, // x축 회전 속도
			rotVelY: .002, // y축 회전 속도
			
			repaintColor: '#111', // 배경색상
			connectionColor: 'hsla(200,60%,light%,alp)', // 연결된 공들 색상같은데, 전체적으로 색이 일부만 바뀜
			rootColor: 'hsla(0,60%,light%,alp)', // 제일 가운데 공 색상
			endColor: 'hsla(160,20%,light%,alp)', // 맨 끝의 공들 색상
			dataColor: 'hsla(40,80%,light%,alp)', // 불꽃 색상
			
			wireframeWidth: .1, // 공과 공이 연결된 선의 두께
			wireframeColor: '#88f', // 공과 공이 연결된 선의 색상
			
			depth: 250, // 확대 - 크기가 작아지면 확대됨
			focalLength: 250, // 축소 - 크기가 작아지면 축소됨
			vanishPoint: { // 위치 (디폴트값이 가운데정렬)
				x: w / 2,
				y: h / 2
			}
		},
		
		squareRange = opts.range * opts.range,
		squareAllowed = opts.allowedDist * opts.allowedDist,
		mostDistant = opts.depth + opts.range,
        sinX = 0,
        sinY = 0,
        cosX = 0,
        cosY = 0,
		
		connections = [],
		toDevelop = [],
		data = [],
		all = [],
		tick = 0,
		totalProb = 0,
		
		animating = false,
		
		Tau = Math.PI * 2;

        ctx.fillStyle = '#222';
        ctx.fillRect( 0, 0, w, h );
        ctx.fillStyle = '#ccc';
        ctx.font = '50px Verdana';
        ctx.fillText( 'Calculating Nodes', w / 2 - ctx.measureText( 'Calculating Nodes' ).width / 2, h / 2 - 15 );

        window.setTimeout( init, 4 ); // to render the loading screen

        function init(){
            
            connections.length = 0;
            data.length = 0;
            all.length = 0;
            toDevelop.length = 0;
            
            var connection = new Connection( 0, 0, 0, opts.baseSize );
            connection.step = Connection.rootStep;
            connections.push( connection );
            all.push( connection );
            connection.link();
            
            while( toDevelop.length > 0 ){
            
                toDevelop[ 0 ].link();
                toDevelop.shift();
            }
            
            if( !animating ){
                animating = true;
                anim();
            }
        }
        function Connection( x, y, z, size ){
            
            this.x = x;
            this.y = y;
            this.z = z;
            this.size = size;
            
            this.screen = {};
            
            this.links = [];
            this.probabilities = [];
            this.isEnd = false;
            
            this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
        }
        Connection.prototype.link = function(){
            
            if( this.size < opts.minSize )
                return this.isEnd = true;
            
            var links = [],
                    connectionsNum = opts.baseConnections + Math.random() * opts.addedConnections |0,
                    attempt = opts.connectionAttempts,
                    
                    alpha, beta, len,
                    cosA, sinA, cosB, sinB,
                    pos = {},
                    passedExisting, passedBuffered;
            
            while( links.length < connectionsNum && --attempt > 0 ){
                
                alpha = Math.random() * Math.PI;
                beta = Math.random() * Tau;
                len = opts.baseDist + opts.addedDist * Math.random();
                
                cosA = Math.cos( alpha );
                sinA = Math.sin( alpha );
                cosB = Math.cos( beta );
                sinB = Math.sin( beta );
                
                pos.x = this.x + len * cosA * sinB;
                pos.y = this.y + len * sinA * sinB;
                pos.z = this.z + len *        cosB;
                
                if( pos.x*pos.x + pos.y*pos.y + pos.z*pos.z < squareRange ){
                
                    passedExisting = true;
                    passedBuffered = true;
                    for( var i = 0; i < connections.length; ++i )
                        if( squareDist( pos, connections[ i ] ) < squareAllowed )
                            passedExisting = false;

                    if( passedExisting )
                        for( var i = 0; i < links.length; ++i )
                            if( squareDist( pos, links[ i ] ) < squareAllowed )
                                passedBuffered = false;

                    if( passedExisting && passedBuffered )
                        links.push( { x: pos.x, y: pos.y, z: pos.z } );
                    
                }
                
            }
            
            if( links.length === 0 )
                this.isEnd = true;
            else {
                for( var i = 0; i < links.length; ++i ){
                    
                    var pos = links[ i ],
                            connection = new Connection( pos.x, pos.y, pos.z, this.size * opts.sizeMultiplier );
                    
                    this.links[ i ] = connection;
                    all.push( connection );
                    connections.push( connection );
                }
                for( var i = 0; i < this.links.length; ++i )
                    toDevelop.push( this.links[ i ] );
            }
        }
        Connection.prototype.step = function(){
            
            this.setScreen();
            this.screen.color = ( this.isEnd ? opts.endColor : opts.connectionColor ).replace( 'light', 30 + ( ( tick * this.glowSpeed ) % 30 ) ).replace( 'alp', .2 + ( 1 - this.screen.z / mostDistant ) * .8 );
            
            for( var i = 0; i < this.links.length; ++i ){
                ctx.moveTo( this.screen.x, this.screen.y );
                ctx.lineTo( this.links[ i ].screen.x, this.links[ i ].screen.y );
            }
        }
        Connection.rootStep = function(){
            this.setScreen();
            this.screen.color = opts.rootColor.replace( 'light', 30 + ( ( tick * this.glowSpeed ) % 30 ) ).replace( 'alp', ( 1 - this.screen.z / mostDistant ) * .8 );
            
            for( var i = 0; i < this.links.length; ++i ){
                ctx.moveTo( this.screen.x, this.screen.y );
                ctx.lineTo( this.links[ i ].screen.x, this.links[ i ].screen.y );
            }
        }
        Connection.prototype.draw = function(){
            ctx.fillStyle = this.screen.color;
            ctx.beginPath();
            ctx.arc( this.screen.x, this.screen.y, this.screen.scale * this.size, 0, Tau );
            ctx.fill();
        }
        function Data( connection ){
            
            this.glowSpeed = opts.baseGlowSpeed + opts.addedGlowSpeed * Math.random();
            this.speed = opts.baseSpeed + opts.addedSpeed * Math.random();
            
            this.screen = {};
            
            this.setConnection( connection );
        }
        Data.prototype.reset = function(){
            
            this.setConnection( connections[ 0 ] );
            this.ended = 2;
        }
        Data.prototype.step = function(){
            
            this.proportion += this.speed;
            
            if( this.proportion < 1 ){
                this.x = this.ox + this.dx * this.proportion;
                this.y = this.oy + this.dy * this.proportion;
                this.z = this.oz + this.dz * this.proportion;
                this.size = ( this.os + this.ds * this.proportion ) * opts.dataToConnectionSize;
            } else 
                this.setConnection( this.nextConnection );
            
            this.screen.lastX = this.screen.x;
            this.screen.lastY = this.screen.y;
            this.setScreen();
            this.screen.color = opts.dataColor.replace( 'light', 40 + ( ( tick * this.glowSpeed ) % 50 ) ).replace( 'alp', .2 + ( 1 - this.screen.z / mostDistant ) * .6 );
            
        }
        Data.prototype.draw = function(){
            
            if( this.ended )
                return --this.ended; // not sre why the thing lasts 2 frames, but it does
            
            ctx.beginPath();
            ctx.strokeStyle = this.screen.color;
            ctx.lineWidth = this.size * this.screen.scale;
            ctx.moveTo( this.screen.lastX, this.screen.lastY );
            ctx.lineTo( this.screen.x, this.screen.y );
            ctx.stroke();
        }
        Data.prototype.setConnection = function( connection ){
            
            if( connection.isEnd )
                this.reset();
            
            else {
                
                this.connection = connection;
                this.nextConnection = connection.links[ connection.links.length * Math.random() |0 ];
                
                this.ox = connection.x; // original coordinates
                this.oy = connection.y;
                this.oz = connection.z;
                this.os = connection.size; // base size
                
                this.nx = this.nextConnection.x; // new
                this.ny = this.nextConnection.y;
                this.nz = this.nextConnection.z;
                this.ns = this.nextConnection.size;
                
                this.dx = this.nx - this.ox; // delta
                this.dy = this.ny - this.oy;
                this.dz = this.nz - this.oz;
                this.ds = this.ns - this.os;
                
                this.proportion = 0;
            }
        }
        Connection.prototype.setScreen = Data.prototype.setScreen = function(){
            
            var x = this.x,
                    y = this.y,
                    z = this.z;
            
            // apply rotation on X axis
            var Y = y;
            y = y * cosX - z * sinX;
            z = z * cosX + Y * sinX;
            
            // rot on Y
            var Z = z;
            z = z * cosY - x * sinY;
            x = x * cosY + Z * sinY;
            
            this.screen.z = z;
            
            // translate on Z
            z += opts.depth;
            
            this.screen.scale = opts.focalLength / z;
            this.screen.x = opts.vanishPoint.x + x * this.screen.scale;
            this.screen.y = opts.vanishPoint.y + y * this.screen.scale;
            
    }
    function squareDist( a, b ){
        
        var x = b.x - a.x,
                y = b.y - a.y,
                z = b.z - a.z;
        
        return x*x + y*y + z*z;
    }

    function anim(){
        
        window.requestAnimationFrame( anim );
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = opts.repaintColor;
        ctx.fillRect( 0, 0, w, h );
        
        ++tick;
        
        var rotX = tick * opts.rotVelX,
                rotY = tick * opts.rotVelY;
        
        cosX = Math.cos( rotX );
        sinX = Math.sin( rotX );
        cosY = Math.cos( rotY );
        sinY = Math.sin( rotY );
        
        if( data.length < connections.length * opts.dataToConnections ){
            var datum = new Data( connections[ 0 ] );
            data.push( datum );
            all.push( datum );
        }
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.lineWidth = opts.wireframeWidth;
        ctx.strokeStyle = opts.wireframeColor;
        all.map( function( item ){ item.step(); } );
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        all.sort( function( a, b ){ return b.screen.z - a.screen.z } );
        all.map( function( item ){ item.draw(); } );
        
        /*ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.arc( opts.vanishPoint.x, opts.vanishPoint.y, opts.range * opts.focalLength / opts.depth, 0, Tau );
        ctx.stroke();*/
    }

    window.addEventListener( 'resize', function(){
        
        opts.vanishPoint.x = ( w = c.width = size ) / 2;
        opts.vanishPoint.y = ( h = c.height = size ) / 2;
        ctx.fillRect( 0, 0, w, h );
    });
    window.addEventListener( 'click', init );
    }, [])

    return(
        <canvas ref={ref} className={classes.canvas}>
        </canvas>
    )
}

export default React.memo(Visualization);