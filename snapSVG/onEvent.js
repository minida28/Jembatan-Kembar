console.log("DATA POINTS", ctrl);

var val0 = ctrl.series[0].datapoints[0];
// val0 = Number(val0.toFixed(2));

var val1 = ctrl.series[1].datapoints[0];
// val1 = Number(val1.toFixed(2))/2;

var val2 = ctrl.series[2].datapoints[0];
// val2 = Number(val2.toFixed(2))/2;

// console.log("DATA POINTS",ctrl.series[0].datapoints);
// console.log("DATA POINTS",ctrl);

// console.log(val0, val1, val2);


// Properties of a line 
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

// Position of a control point 
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
const controlPoint = (current, previous, next, reverse) => {

    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const o = line(p, n);

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

// Create the bezier curve command 
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
const bezierCommand = (point, i, a) => {

    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point);

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
};

// Render the svg <path> element 
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
const svgPath = (points, command) => {
    // build the d attributes by looping over the points
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, i, a)}`
        , '');
    return `<path d="${d}" fill="none" stroke="grey" />`;
    // return `${d}`
};

rand = function (min, max) {
    if (min === null && max === null)
        return 0;

    if (max === null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};



// The smoothing ratio
const smoothing = 0.18;

// var xStart = 100;
// var yStart = 600;
// var bridgeLength = 1700;
// var leftSpanLength = 450;
// var midSpanLength = 800;
// var rightSpanLength = 450;

var curve_dyn;
var dotArray = [];

var curveShiftPoints = [0, 0, 0, 0, 0];
var pointsInit = new Array(5);
var points = [];

var lvdtVals = [0, 0];

var lvdtValArray = [
    // [xStart + 46, yStart + 266],
    // [pointsInit[6][0], pointsInit[6][1]]
];


var s = Snap(svgnode);

// var main_svg = s.select('#_x30_');
// console.log(s)

var curve_initial = s.select('#curve_initial');
var curve_dyn = s.select('#curve_dyn');

if (curve_initial && curve_dyn) {
    SVGLoaded();
}

function SVGLoaded() {

    for (var i = 0; i < pointsInit.length; i++) {
        verLineStr = '#verLine_' + i;
        verLine = s.select(verLineStr);
        // console.log("verLine", verLine)
        
        // curve_initial = s.select('#curve_initial');
        // curve_dyn = s.select('#curve_dyn');
        // console.log("horLine", horLine)
        
        // console.log(s.curve_dyn.getAttribute())

        x = verLine.getBBox().x;
        y = curve_initial.getBBox().y;

        var temp = [];
        temp[0] = x;
        temp[1] = y + curveShiftPoints[i];
        console.log(y, curveShiftPoints[i]);

        pointsInit[i] = temp;

        // points[i] = temp;
        // points.push(temp)
        // console.log(temp)
    }

    // Copy the array to change later
    // Note I use JSON.parse & JSON.stringify to clone the array
    // I do not use push or indexing method to coy the value, because
    // the new arrays will still reference to the old array and changing one will affect the other
    // see https://stackoverflow.com/a/45813800

    points = JSON.parse(JSON.stringify(pointsInit));

    // Math.floor(Math.random() * 100)
    // randArray = [rand(0, 100), rand(0, 100), rand(0, 100)]
    points[1][1] = pointsInit[1][1] + Math.floor(val0[0]/10);
    points[2][1] = pointsInit[2][1] + Math.floor(val1[0]/10);
    points[3][1] = pointsInit[3][1] + Math.floor(val2[0]/10);


    // console.log(settle_1, settle_2, settle_3);

    // var s = Snap("#kudus_svg");

    // curve_dyn = s.path(svgPath(points, bezierCommand));
    d = svgPath(points, bezierCommand);
    // console.log(d);
    // console.log(d.length, d);
    // console.log(d.splice(4, 10))
    var res = d.slice(4, -3);
    // console.log(res)

    var animate = true;
    var t_Animate = 1000;
    var anim_effect = mina.easein;


    // curve_dyn = s.select("#curve_dyn");

    if (animate) {
        curve_dyn.animate({ d: d }, t_Animate, anim_effect);
    } else {
        curve_dyn.attr({
            d: d,
        });
    }


    i = 0;
    points.forEach(function (el, index) {

        if (index == 1 || index == 2 || index == 3) {

            // DOTS
            var yLast = points[index][1];

            var yDot;

            str = '#dot_' + i;
            var dot = s.select(str);

            if (animate)
                dot.animate({ cy: yLast }, t_Animate, anim_effect);
            else
                dot.attr({ cy: yLast });


            // TEXT SETTLEMENT
            strTxt = '#txt_' + i;
            var txt = s.select(strTxt);

            var txtHeight = txt.getBBox().y2 - txt.getBBox().y;
            // console.log('txtHeight', txtHeight)

            var yTxt = 0;
            var dotHeight = (dot.getBBox().y2 - dot.getBBox().y);
            if (points[index][1] <= pointsInit[index][1]) {
                // yTxt = yLast - dotHeight / 2 - 0 + txtHeight;
                yTxt = yLast + dotHeight / 2 + 0 + txtHeight;
            } else {
                yTxt = yLast + dotHeight / 2 + 0 + txtHeight;
            }

            txt.attr({
                text: (pointsInit[index][1] - points[index][1]) + 'mm'
            });

            if (animate)
                txt.animate({ y: yTxt }, t_Animate, anim_effect);
            else
                txt.attr({ y: yTxt });

            i++;
        }
    });
}
