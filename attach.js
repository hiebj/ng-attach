(function() {
    'use strict';
    angular
        .module('attach', [])
        .directive('attach', attach);

    function attach($window, $document) {
        function link($scope, $element, $attrs) {
            var alignedEl = getAlignedEl($element, $attrs),
                anchorEl = getAnchorEl($element, $attrs),
                anchorRect = null,
                nextFrame = getNextFrameFn() || watchPosition;

            alignLoop();

            function alignLoop() {
                anchorRect = anchorEl[0].getBoundingClientRect();
                align();
                nextFrame(alignLoop);
            }

            function watchPosition() {
                $scope.$watch(getAnchorPosition, align);
                $scope.$watch($attrs.align, align);
                angular.element($window).on('resize', align);
            }

            function getAnchorPosition() {
                anchorRect = anchorEl[0].getBoundingClientRect();
                return ('x' + anchorRect.left + 'y' + anchorRect.top);
            }

            function align() {
                var alignFlags = $attrs.align ? $scope.$eval($attrs.align) : 'tl bl',
                    style = alignedEl.attr('style');
                if (style) {
                    alignedEl.attr('style', style.replace(/position|top|right|bottom|left[^;]+;/g, ''));
                }
                if (alignFlags) {
                    alignedEl.css(getAlignmentCSS(alignFlags.split(' ')));
                }
            }

            function getAlignmentCSS(alignFlags) {
                var css = {
                        position: 'absolute'
                    },
                    alignedAttach = getAttachment(alignFlags[0]),
                    anchorAttach = getAttachment(alignFlags[1]),
                    alignedRect = alignedEl[0].getBoundingClientRect();

                // set position of alignedEl's attachment to match the absolute position of the anchorEl's attachment
                css[alignedAttach.x] = anchorRect[anchorAttach.x] + $window.scrollX;
                css[alignedAttach.y] = anchorRect[anchorAttach.y] + $window.scrollY;
                // check if we need to center the attachment points
                if (alignedAttach.centerX) {
                    css[alignedAttach.x] = css[alignedAttach.x] -
                    // half of the aligned element's width
                    ((alignedRect.right - alignedRect.left) / 2);
                }
                if (alignedAttach.centerY) {
                    css[alignedAttach.y] = css[alignedAttach.y] -
                    // half of the aligned element's height
                    ((alignedRect.bottom - alignedRect.top) / 2);
                }
                if (anchorAttach.centerX) {
                    css[alignedAttach.x] = css[alignedAttach.x] +
                    // half of the anchor element's width
                    ((anchorRect.right - anchorRect.left) / 2);
                }
                if (anchorAttach.centerY) {
                    css[alignedAttach.y] = css[alignedAttach.y] +
                    // half of the anchor element's height
                    ((anchorRect.bottom - anchorRect.top) / 2);
                }
                // check if we need to invert the value to be relative to the correct boundary
                if (alignedAttach.x === 'right') {
                    css[alignedAttach.x] = $window.innerWidth - css[alignedAttach.x];
                }
                if (alignedAttach.y === 'bottom') {
                    css[alignedAttach.y] = $window.innerHeight - css[alignedAttach.y];
                }
                // add 'px'
                css[alignedAttach.x] = css[alignedAttach.x] + 'px';
                css[alignedAttach.y] = css[alignedAttach.y] + 'px';
                return css;
            }
        }

        function getAlignedEl($element, $attrs) {
            var el = $element;
            if ($attrs.alignParent) {
                el = angular.element(getAlignParent($element, $attrs));
            }
            return el;
        }

        function getAlignParent($element, $attrs) {
            var dom = $element[0],
                selector = $attrs.alignParent,
                matcher = getSelectorMatcher(dom);
            if ($element.parents) {
                dom = $element.parents(selector)[0];
            } else {
                while (dom && !matcher.bind(dom)(selector)) { dom = dom.parentNode; }
            }
            if (!dom) { throw 'ng-attach: alignParent selector did not match any parent: "' + selector + '"'; }
            return dom;
        }

        function getSelectorMatcher(dom) {
            return dom.matches ||
                dom.webkitMatchesSelector ||
                dom.mozMatchesSelector ||
                dom.msMatchesSelector ||
                dom.oMatchesSelector ||
                idMatchesSelector;

            function idMatchesSelector(selector) {
                /* jshint validthis: true */
                return this.id === selector.replace(/^#/, '');
            }
        }

        function getAnchorEl($element, $attrs) {
            var selector = $attrs.attach,
                dom;
            if ($window.jQuery || $element.is) {
                dom = angular.element(selector)[0];
            } else if ($document[0].querySelector) {
                dom = $document[0].querySelector(selector);
            } else {
                dom = $document[0].getElementById(selector.replace(/^#/, ''));
            }
            return angular.element(dom);
        }

        function getNextFrameFn() {
            return $window.requestAnimationFrame ||
                $window.oRequestAnimationFrame ||
                $window.mozRequestAnimationFrame ||
                $window.webkitRequestAnimationFrame ||
                $window.msRequestAnimationFrame;
        }

        function getAttachment(alignFlag) {
            var attachment = {
                x: 'left',
                y: 'top'
            };
            if (alignFlag.indexOf('b') !== -1) {
                attachment.y = 'bottom';
            } else if (alignFlag.indexOf('t') === -1) {
                attachment.centerY = true;
            }
            if (alignFlag.indexOf('r') !== -1) {
                attachment.x = 'right';
            } else if (alignFlag.indexOf('l') === -1) {
                attachment.centerX = true;
            }
            return attachment;
        }

        return {
            restrict: 'A',
            link: link
        };
    }
})();
