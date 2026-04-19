// extendscript.jsx — AE-Quick Panel V1 for After Effects
// All functions called from CEP panel via evalScript()

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function getComp() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        return null;
    }
    return comp;
}

function getSelectedLayers(comp) {
    return comp.selectedLayers;
}

// ─────────────────────────────────────────────
//  EASY SHORTCUT BUTTONS
// ─────────────────────────────────────────────

function createSolid() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    app.beginUndoGroup("Create Solid");
    try {
        var solid = comp.layers.addSolid(
            [0.5, 0.5, 0.5],
            "Solid",
            comp.width,
            comp.height,
            comp.pixelAspect
        );
        solid.moveToEnd();
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function createNull() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    app.beginUndoGroup("Create Null");
    try {
        var nullLayer = comp.layers.addNull();
        nullLayer.name = "Null";
        nullLayer.position.setValue([comp.width / 2, comp.height / 2]);
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function createCamera() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    app.beginUndoGroup("Create Camera");
    try {
        var camera = comp.layers.addCamera("Camera 1", [comp.width / 2, comp.height / 2]);
        // Set Z position so it matches AE default view
        camera.position.setValue([comp.width / 2, comp.height / 2, -1777.78]);
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function createPreComp() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    var selected = getSelectedLayers(comp);
    if (selected.length === 0) return "ERROR: No layers selected.";

    app.beginUndoGroup("Pre-Compose");
    try {
        var indices = [];
        for (var i = 0; i < selected.length; i++) {
            indices.push(selected[i].index);
        }
        comp.layers.precompose(indices, "Pre-comp 1", true);
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function createAdjustment() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    app.beginUndoGroup("Create Adjustment Layer");
    try {
        var adj = comp.layers.addSolid(
            [1, 1, 1],
            "Adjustment Layer",
            comp.width,
            comp.height,
            comp.pixelAspect
        );
        adj.adjustmentLayer = true;
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function reCenter() {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    var selected = getSelectedLayers(comp);
    if (selected.length === 0) return "ERROR: No layers selected.";

    app.beginUndoGroup("Re-Center Layer");
    try {
        for (var i = 0; i < selected.length; i++) {
            var layer = selected[i];
            // Move layer's position so anchor point sits at comp center
            // (visually snaps the layer's anchor to comp center)
            layer.position.setValue([comp.width / 2, comp.height / 2]);
        }
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

// ─────────────────────────────────────────────
//  ANCHOR POINT TOOLS
//  Positions: "TL","TC","TR","ML","MC","MR","BL","BC","BR"
// ─────────────────────────────────────────────

function setAnchorPoint(position) {
    var comp = getComp();
    if (!comp) return "ERROR: No active composition.";
    var selected = getSelectedLayers(comp);
    if (selected.length === 0) return "ERROR: No layers selected.";

    app.beginUndoGroup("Set Anchor Point — " + position);
    try {
        for (var i = 0; i < selected.length; i++) {
            _applyAnchorPoint(selected[i], position, comp);
        }
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: " + e.message;
    }
    app.endUndoGroup();
    return "OK";
}

function _applyAnchorPoint(layer, position, comp) {
    var t = comp.time;
    var rect;

    try {
        rect = layer.sourceRectAtTime(t, false);
    } catch (e) {
        // Fallback: use comp bounds in layer space
        rect = { left: 0, top: 0, width: comp.width, height: comp.height };
    }

    var l = rect.left;
    var tp = rect.top;
    var w = rect.width;
    var h = rect.height;

    var newAP;
    switch (position) {
        case "TL": newAP = [l,         tp        ]; break;
        case "TC": newAP = [l + w / 2, tp        ]; break;
        case "TR": newAP = [l + w,     tp        ]; break;
        case "ML": newAP = [l,         tp + h / 2]; break;
        case "MC": newAP = [l + w / 2, tp + h / 2]; break;
        case "MR": newAP = [l + w,     tp + h / 2]; break;
        case "BL": newAP = [l,         tp + h    ]; break;
        case "BC": newAP = [l + w / 2, tp + h    ]; break;
        case "BR": newAP = [l + w,     tp + h    ]; break;
        default:   return;
    }

    var oldAP  = layer.anchorPoint.value;
    var oldPos = layer.position.value;

    // Delta in layer space
    var dx = newAP[0] - oldAP[0];
    var dy = newAP[1] - oldAP[1];

    // Transform delta from layer space → comp space
    // accounting for scale and rotation (2D only; ignores 3D / parent chain)
    var scaleVal = layer.scale.value;
    var sx = scaleVal[0] / 100;
    var sy = scaleVal[1] / 100;

    var rot = 0;
    try { rot = layer.rotation.value * Math.PI / 180; } catch (e) {}

    var cosR = Math.cos(rot);
    var sinR = Math.sin(rot);

    var compDx = dx * sx * cosR - dy * sy * sinR;
    var compDy = dx * sx * sinR + dy * sy * cosR;

    layer.anchorPoint.setValue(newAP);
    layer.position.setValue([oldPos[0] + compDx, oldPos[1] + compDy]);
}
