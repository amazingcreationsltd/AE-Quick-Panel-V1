// main.js — CEP bridge for AE-Quick Panel V1

var cs = new CSInterface();

/**
 * Call an ExtendScript function by name with optional args.
 * script: full evalScript string e.g. 'createSolid()'
 */
function callAE(script) {
    cs.evalScript(script, function (result) {
        if (!result) return;
        if (result === "EvalScript error" || result.indexOf("ERROR:") === 0) {
            showToast(result.replace("ERROR: ", ""), true);
        }
        // "OK" results are silent — no need to toast on success
    });
}

// ── Feedback toast ──────────────────────────────────────────
var toastTimer = null;

function showToast(msg, isError) {
    var toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className = "toast show" + (isError ? " error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.className = "toast";
    }, 2500);
}

// ── Button ripple feedback ───────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    var btns = document.querySelectorAll(".tool-btn, .anchor-btn");
    btns.forEach(function (btn) {
        btn.addEventListener("mousedown", function () {
            btn.classList.add("pressed");
        });
        btn.addEventListener("mouseup", function () {
            btn.classList.remove("pressed");
        });
        btn.addEventListener("mouseleave", function () {
            btn.classList.remove("pressed");
        });
    });
});
