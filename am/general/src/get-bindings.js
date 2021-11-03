/**
 * @file Get information about bindings available in the script context
 * in ForgeRock Access Management (AM).
 * Bindings are available as the top-level variables in the scripting context,
 * and can be derived as properties of the this property of the execution context.
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/scripting-guide/scripting-functionality.html}.
 */

/**
 * Use function scope to avoid
 * adding variables to the top-level scope where the bindings are defined,
 * and inconsistent casting behavior that may occur in the top-level scope in AM Rhino.
 */
(function () {
    /**
     * The binding object to be returned in the list of bindings.
     * @typedef {object} binding
     * @property {string} name - The user identifier.
     * @property {string} value - A message describing the outcome.
     * @property {string} [className] - The Java class the binding is an instance of.
     */

    /**
     * Get a list of the binding names from the top-level scope.
     * @param {string[]} [filter=['context']] - An array of variable names to be excluded from the results.
     * By default, exclude the context variable that is added to the top-level scope by the scripting engine.
     * @returns {string[]} An array of property names associated with the this object, except names specified in the filter.
     */
    function getBindingNames(filter) {
        filter = (filter || []).concat([
            'context'
        ]);

        return Object.keys(this).filter(function (e) {
            return filter.indexOf(e) === -1;
        }).sort();
    }

    /**
     * @returns {object[]} An array of binding objects.
     * Each binding is an object with the binding name as  key and the binding properties as the value.
     */
    function getBindings() {
        function getBinding(bindingName) {
            /**
             * Get name for the Java class the binding is instance of.
             * @param {string} bindingName
             * @returns {string} The class name.
             */
            function getBindingClassName(bindingName) {
                /**
                 * In the AM administrative console, under
                 * CONFIGURE > GLOBAL SERVICES > Scripting > Secondary Configurations > {script type} > Secondary Configurations > engineConfiguration
                 * remove java.land.Class from the Java class blacklist and add it to the Java class whitelist
                 * in order for the class property to become available for the script.
                 * Otherwise, attempts to access the class property will result in exception:
                 * Access to Java class "java.lang.Class" is prohibited.
                 */
                try {
                    var classProperty = this[bindingName].class;
                    if (classProperty) {
                        return String(classProperty.getName());
                    }
                } catch (e) {
                    // return String(e);
                }
            }

            function getBindingValue(bindingName) {
                try {
                    return String(this[bindingName]);
                } catch (e) {
                    // return String(e);
                }
            }

            var binding = {};
            var bindingClassName;

            binding.name = bindingName;
            binding.value = getBindingValue(bindingName);

            bindingClassName = getBindingClassName(bindingName);
            if (bindingClassName) {
                binding.className = bindingClassName;
            }

            return binding;
        }

        var bindings = getBindingNames().map(function (bindingName) {
            return getBinding(bindingName);
        });

        return bindings;
    }

    logger.error('Bindings: ' + getBindingNames().join(', '));
    getBindings().forEach(function (binding) {
        // logger.error(JSON.stringify(binding));

        var message = binding.name;
        if (binding.className) {
            message += ' (' + binding.className + ')';
        }
        message += ': ' + binding.value;
        logger.error(message);
    });

    outcome = 'true';
}());
