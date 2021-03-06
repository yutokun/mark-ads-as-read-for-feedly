chrome.storage.local.get(['options', 'positions'], function(items) {
    'use strict';

    const START_WITH = 0;
    const INCLUDE    = 1;

    let strs
      , positions
      , openedItemIds = {};

    if (typeof items.options !== 'undefined') {
        strs = items.options;
    } else {
        strs = ['PR:', 'AD:', '[PR]'];
    }

    if (typeof items.positions !== 'undefined') {
        positions = items.positions;
    } else {
        positions = [];
        if (typeof items.options !== 'undefined') {
            items.options.forEach(function() {
                positions.push(START_WITH);
            });
        } else {
            positions = [START_WITH, START_WITH, START_WITH];
        }
    }

    //console.log('[MARF] %o', strs);
    //console.log('[MARF] %o', positions);

    function observerCallback(mutationsList, observer) {
        //console.log(mutationsList);
        mutationsList.forEach(mutation => {
            checkMutationRecord(mutation);
        });
    }

    function checkMutationRecord(mutation) {
        mutation.addedNodes.forEach(addedNode => {
            checkAddedNode(addedNode);
        });
    }

    function checkAddedNode(addedNode) {
        if (addedNode.nodeType !== 1) {
            return;
        }

        if (addedNode.classList.contains('EntryList__chunk')) {
            readProcess(addedNode);
            return;
        }

        addedNode.querySelectorAll('.EntryList__chunk').forEach(el => {
            readProcess(el);
        });
    }

    function readProcess(entryListChunk) {
        //console.log(entryListChunk);
        entryListChunk.childNodes.forEach(el => {
            if (!el.id.match(/_main$/)) {
                return;
            }

            if (typeof el.dataset.title === 'undefined') {
                return false;
            }

            strs.forEach(function(str, i) {
                if (str === '') {
                    return;
                }

                let strIndex = el.dataset.title.toLowerCase().indexOf(str.toLowerCase());

                // Matched
                if (
                    (positions[i] === START_WITH && strIndex === 0)
                    || (positions[i] === INCLUDE && strIndex !== -1)
                ) {
                    let event = el.ownerDocument.createEvent('MouseEvents');
                    //console.log('MATCHED!!', str);

                    openedItemIds[el.id] = true;

                    event.initMouseEvent(
                        'click', true, true,
                        el.ownerDocument.defaultView,
                        1, 0, 0, 0, 0,
                        false, false, false, false,
                        0, null
                    );

                    setTimeout(() => {
                        //console.log('[MARF] %o', el.id);
                        el.dispatchEvent(event);
                        //console.log('[MARF] %s %d', str, i);
                    }, 100);
                }
            });
        });
    }

    const observer = new MutationObserver(observerCallback);

    observer.observe(document.body, {
        childList: true,
        attributes: false,
        subtree: true
    });

    /*
    document.body.addEventListener("DOMSubtreeModified", function(e) {
        let el = e.target;

        if (el.nodeType !== 1) {
            return false;
        }

        if (typeof openedItemIds[el.id] !== 'undefined') {
            let entryHolderId = el.id.replace(/_main$/, '_entryHolder');

            console.log('[MARF] hidden %s', entryHolderId);

            // To prevent scroll to top, use setTimeout
            setTimeout(function() {
                document.getElementById(entryHolderId).style.opacity = '0.5';
            }, 100);

            return true;
        }
    }, false);
    */
});
