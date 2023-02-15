import * as THREE from 'three';
import { ITransform, IColorRangeItem, Box, Points } from 'pc-render';
import { statisticPositionVInfo, getMaxMinInfo } from './position';
import { Lut } from 'three/examples/jsm/math/Lut';

const lut = new Lut();
const colorKeyCode = 'PointColor';

export function getTransformFrom3Point(points: THREE.Vector3[]) {
    let xDir = new THREE.Vector3().copy(points[1]).sub(points[0]);
    let yDir = new THREE.Vector3().copy(points[2]).sub(points[1]);
    let center = new THREE.Vector3()
        .copy(points[0])
        .add(points[1])
        .multiplyScalar(0.5)
        .addScaledVector(yDir, 0.5);

    let angle = xDir.angleTo(new THREE.Vector3(1, 0, 0));

    angle = xDir.y > 0 ? angle : -angle;

    return {
        scale: new THREE.Vector3(xDir.length(), yDir.length(), 0),
        position: new THREE.Vector3(center.x, center.y, 0),
        rotation: new THREE.Euler(0, 0, angle),
    };
}
export function computePointN(box: Box, positions: THREE.BufferAttribute) {
    let pointN = 0;
    box.updateMatrixWorld();
    if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
    // console.time('update');
    let bbox = box.geometry.boundingBox;
    if (bbox) {
        let pos = new THREE.Vector3();
        let matrix = new THREE.Matrix4().copy(box.matrixWorld).invert();

        for (let i = 0; i < positions.count; i++) {
            let x = positions.getX(i);
            let y = positions.getY(i);
            let z = positions.getZ(i);
            pos.set(x, y, z).applyMatrix4(matrix);

            if (
                pos.x > bbox.min.x &&
                pos.x < bbox.max.x &&
                pos.y > bbox.min.y &&
                pos.y < bbox.max.y &&
                pos.z > bbox.min.z &&
                pos.z < bbox.max.z
            ) {
                pointN++;
            }
        }
    }
    return pointN;
}
export function getMiniBox(transform: Required<ITransform>, positions: THREE.BufferAttribute) {
    let matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion().setFromEuler(transform.rotation);
    matrix.compose(transform.position, quaternion, transform.scale);

    let invertMatrix = new THREE.Matrix4().copy(matrix).invert();

    let pos = new THREE.Vector3();
    let box = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
    let newBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    let pointN = 0;
    for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        let y = positions.getY(i);
        let z = positions.getZ(i);
        pos.set(x, y, z).applyMatrix4(invertMatrix);

        if (box.containsPoint(pos)) {
            pointN++;
            if (newBox.max.length() === 0 && newBox.min.length() === 0) {
                newBox.max.copy(pos);
                newBox.min.copy(pos);
            } else {
                newBox.expandByPoint(pos);
            }
        }
    }

    let min = newBox.min;
    let max = newBox.max;
    let boxSize = max.clone().sub(min).length();
    if (pointN > 0 && boxSize > 0.1) {
        transform.scale.multiply(
            new THREE.Vector3(
                Math.abs(max.x - min.x),
                Math.abs(max.y - min.y),
                Math.abs(max.z - min.z),
            ),
        );
        let center = min.clone().add(max).divideScalar(2);
        center.applyMatrix4(matrix);
        transform.position.copy(center);
    }

    // return newBox;
}
export function filterPosition(positions: THREE.BufferAttribute, zRange: [number, number]) {
    let filterPosition = [];
    for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        let y = positions.getY(i);
        let z = positions.getZ(i);
        if (z <= zRange[1] && z >= zRange[0]) {
            filterPosition.push(new THREE.Vector3(x, y, z));
        }
    }
    return filterPosition;
}
export function getMiniBox1(
    transform: Required<ITransform>,
    positions: THREE.BufferAttribute,
    heightRange: [number, number],
) {
    let matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion().setFromEuler(transform.rotation);
    matrix.compose(transform.position, quaternion, transform.scale);
    let invertMatrix = new THREE.Matrix4().copy(matrix).invert();

    let pos = new THREE.Vector3();
    let box = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
    // let newBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    // let pointN = 0;
    let offsetFloor = 0.15; // ground offset
    let preData: THREE.Vector3[] = [];

    setPreData();

    if (preData.length === 0) return;

    // filter z
    let info = statisticPositionVInfo(preData);
    let infoRange = getMaxMinInfo(info);
    // console.log('info', info, infoRange);
    // ground offset
    if (infoRange.infoMin + offsetFloor < infoRange.infoMax) {
        infoRange.infoMin += offsetFloor;
    }
    if (infoRange.infoMax <= infoRange.infoMin) return;

    preData = preData.filter((e) => e.z >= infoRange.infoMin && e.z <= infoRange.infoMax);
    transform.position.z = (infoRange.infoMin + infoRange.infoMax) / 2;
    transform.scale.z = Math.abs(infoRange.infoMax - infoRange.infoMin);

    // update matrix
    matrix.compose(transform.position, quaternion, transform.scale);
    invertMatrix = new THREE.Matrix4().copy(matrix).invert();
    // to local pos
    preData.forEach((pos) => {
        pos.applyMatrix4(invertMatrix);
    });

    // x
    info = statisticPositionVInfo(preData, 2, 'x');
    infoRange = getMaxMinInfo(info, { filter: 0 } as any);
    // console.log('info', info, infoRange);
    let positionX = (infoRange.infoMin + infoRange.infoMax) / 2;
    transform.scale.x *= Math.abs(infoRange.infoMax - infoRange.infoMin);

    // y
    info = statisticPositionVInfo(preData, 2, 'y');
    infoRange = getMaxMinInfo(info, { filter: 0 } as any);
    // console.log('info', info, infoRange);
    let positionY = (infoRange.infoMin + infoRange.infoMax) / 2;
    transform.scale.y *= Math.abs(infoRange.infoMax - infoRange.infoMin);

    let center = new THREE.Vector3(positionX, positionY, 0);
    center.applyMatrix4(matrix);
    transform.position.copy(center);

    function setPreData() {
        for (let i = 0; i < positions.count; i++) {
            let x = positions.getX(i);
            let y = positions.getY(i);
            let z = positions.getZ(i);
            pos.set(x, y, z).applyMatrix4(invertMatrix);
            if (
                box.min.x <= pos.x &&
                box.max.x >= pos.x &&
                box.min.y <= pos.y &&
                box.max.y >= pos.y &&
                z <= heightRange[1] &&
                z >= heightRange[0]
            ) {
                preData.push(new THREE.Vector3(x, y, z));
            }
        }
    }
}
export function getColorRange(start: number, end: number, colors: string[]) {
    let ranges: IColorRangeItem[] = [];
    let offset = (end - start) / colors.length;
    colors.forEach((color, index) => {
        let min = start + index * offset;
        let max = start + (index + 1) * offset;

        min = +min.toFixed(4);
        max = +max.toFixed(4);
        ranges.push({ min, max, color: new THREE.Color(color) });
    });

    return ranges;
}
export function getColorRangeByArray(
    colors: string[],
    value: [number, number],
    range: [number, number],
    segment = 6,
) {
    const len = colors.length - 1;
    const lookupTable = colors.map((color, index) => {
        return [index / len, color];
    });
    const mapLinear = (n: number) => THREE.MathUtils.mapLinear(n, 0, 1, value[0], value[1]);
    lut.addColorMap(colorKeyCode, lookupTable as any);
    lut.setColorMap(colorKeyCode, 24);
    let strategy = (value: number) =>
        THREE.MathUtils.mapLinear(Math.asin(value * 2 - 1), -Math.PI / 2, Math.PI / 2, 0, 1);
    let _colors: THREE.Color[] = [];
    for (let i = 0; i < segment; i++) {
        _colors.push(lut.getColor(strategy(i / (segment - 1))));
    }

    let colorMap: IColorRangeItem[] = [];
    colorMap.push({
        min: range[0],
        max: value[0],
        color: _colors[0],
    });

    for (let i = 0; i < segment - 2; i++) {
        colorMap.push({
            min: mapLinear(i / (segment - 2)),
            max: mapLinear((i + 1) / (segment - 2)),
            color: _colors[i + 1],
        });
    }
    colorMap.push({
        min: value[1],
        max: range[1],
        color: _colors[segment - 1],
    });
    return colorMap;
}
