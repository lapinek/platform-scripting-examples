/**
 * @file Parse an XML string into a JavaScript object in AM scripts.
 * @author Konstantin Lapine <konstantin.lapine@forgerock.com>
 */

/**
 * Use function scope for consistent type coercion in AM scripts.
 */
(function () {
    'use strict';

    /**
     * Use a .matchAll polyfill in AM scripts.
     * @example {@link am/general/src/polyfill.String.prototype.matchAll.js} (used here).
     * Using a polyfill will allow for reusing your code unchanged in environments already supporting the functionality provided by the polyfill.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll#regexp.exec_and_matchall}
     */
    if (!String.prototype.matchAll) {
        /**
         * @param {object} - MUST be a global RegEx instance.
         * @returns {string[][]} - An array of matches.
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators}
         */
        String.prototype.matchAll = function (regExp) {
            /**
             * Convert a string to a global RegEx.
             */
            if (typeof regExp === 'string') {
                regExp = new RegExp(regExp, 'g');
            }

            /**
             * Break reference to the original RegEx object, so that it is left intact.
             */
            regExp = new RegExp(regExp);

            /**
             * Ensure that the RegExp is a global one to avoid infinite while loop on RegExp.prototype.exec().
             */
            if (!regExp.global) {
                throw new TypeError('matchAll must be called with a global RegExp');
            }

            var match;
            const allMatches = [];

            /**
             * Collect all matches.
             */
            while ((match = regExp.exec(this)) !== null) {
                allMatches.push(match);
            }

            return allMatches;
        };
    }

    function parseXmlToJs(xmlString) {
        const xmlObject = {};
        /**
         * Search for an XML element, and reference its opening and closing tags and its content via groups.
         */
        const regExp = new RegExp(/<(\w*)(?:\s[^>]*)*>((?:(?!<\1).)*)<\/\1>|<(\w*)(?:\s*)*\/>/g);

        /**
         * Find 'em all.
         */
        const xmlIterator = xmlString.replace(/\n/g, ' ').matchAll(regExp);

        /**
         * Create an array from the iterator object, in case it is returned by natively supported String.prototype.matchAll.
         */
        const xmlArray = Array.from(xmlIterator);

        /**
         * Populate the JavaScript object.
         */
        xmlArray.forEach((matchArray) => {
            /**
             * Check if the key is already populated with a value;
             * if so, it means there is more than one tag with the same name in the XML,
             * and the (multiple) values should be assembled in an array,
             * which will be assigned to the key.
             * @param {string, array} currentValue - Current value associated with the key.
             * @param {string, array} newValue - New value found for the tag.
             * @returns {string, array}
             */
            function getValue(currentValue, newValue) {
                var value;

                if (currentValue) {
                    value = currentValue;
                    if (!Array.isArray(currentValue)) {
                        value = [currentValue];
                    }
                    value.push(newValue);
                } else {
                    value = newValue;
                }

                return value;
            }

            const key = matchArray[1] || matchArray[3];

            /**
             * Parse nesting XML elements recursively.
             */
            const value = matchArray[2] && parseXmlToJs(matchArray[2]);

            if (value && Object.keys(value).length) {
                xmlObject[key] = getValue(xmlObject[key], value);
            } else {
                xmlObject[key] = getValue(xmlObject[key], (matchArray[2] || null));
            }
        });

        return xmlObject;
    }

    try {
        /**
         * Example XML strings.
         */
        const xmlStrings = [
            '<?xml version="1.0"?> \n\
            <catalog> \n\
                <book id="bk101"> \n\
                    <author>Gambardella, Matthew</author> \n\
                    <title>XML Developer \'s Guide</title> \n\
                    <genre>Computer</genre> \n\
                    <price /> \n\
                    <publish_date>2000-10-01</publish_date> \n\
                    <description>An in-depth look at creating applications with XML.</description> \n\
                </book> \n\
                <book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-12-16</publish_date><description>A former architect battles corporate zombies, an evil sorceress, and her own childhood to become queen of the world.</description></book><book id="bk103"><author>Corets, Eva</author><title>Maeve Ascendant</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-11-17</publish_date><description>After the collapse of a nanotechnology society in England, the young survivors lay the foundation for a new society.</description></book><book id="bk104"><author>Corets, Eva</author><title>Oberon \'s Legacy</title><genre>Fantasy</genre><price>5.95</price><publish_date>2001-03-10</publish_date><description>In post-apocalypse England, the mysterious agent known only as Oberon helps to create a new life for the inhabitants of London. Sequel to Maeve Ascendant.</description></book><book id="bk105"><author>Corets, Eva</author><title>The Sundered Grail</title><genre>Fantasy</genre><price>5.95</price><publish_date>2001-09-10</publish_date><description>The two daughters of Maeve, half-sisters, battle one another for control of England. Sequel to Oberon \'s Legacy.</description></book><book id="bk106"><author>Randall, Cynthia</author><title>Lover Birds</title><genre>Romance</genre><price>4.95</price><publish_date>2000-09-02</publish_date><description>When Carla meets Paul at an ornithology conference, tempers fly as feathers get ruffled.</description></book><book id="bk107"><author>Thurman, Paula</author><title>Splish Splash</title><genre>Romance</genre><price>4.95</price><publish_date>2000-11-02</publish_date><description>A deep sea diver finds true love twenty thousand leagues beneath the sea.</description></book><book id="bk108"><author>Knorr, Stefan</author><title>Creepy Crawlies</title><genre>Horror</genre><price>4.95</price><publish_date>2000-12-06</publish_date><description>An anthology of horror stories about roaches, centipedes, scorpions and other insects.</description></book><book id="bk109"><author>Kress, Peter</author><title>Paradox Lost</title><genre>Science Fiction</genre><price>6.95</price><publish_date>2000-11-02</publish_date><description>After an inadvertant trip through a Heisenberg Uncertainty Device, James Salway discovers the problems of being quantum.</description></book><book id="bk110"><author>O \'Brien, Tim</author><title>Microsoft .NET: The Programming Bible</title><genre>Computer</genre><price>36.95</price><publish_date>2000-12-09</publish_date><description>Microsoft \'s .NET initiative is explored in detail in this deep programmer \'s reference.</description></book><book id="bk111"><author>O \'Brien, Tim</author><title>MSXML3: A Comprehensive Guide</title><genre>Computer</genre><price>36.95</price><publish_date>2000-12-01</publish_date><description>The Microsoft MSXML3 parser is covered in detail, with attention to XML DOM interfaces, XSLT processing, SAX and more.</description></book><book id="bk112"><author>Galos, Mike</author><title>Visual Studio 7: A Comprehensive Guide</title><genre>Computer</genre><price>49.95</price><publish_date>2001-04-16</publish_date><description>Microsoft Visual Studio 7 is explored in depth, looking at how Visual Basic, Visual C++, C#, and ASP+ are integrated into a comprehensive development environment.</description></book> \n\
            </catalog>',
            /**
             * Other example XML strings.
             */
            '<dependency> \
                <groupId>com.forgerock.autonomous.ci-tmp</groupId> \
                <artifactId>access-ai-nodes</artifactId> \
                <version>1.0-20220426.194812-1</version> \
            </dependency>',
            '<InvalidPassword>\n\
            <InvalidCount>3</InvalidCount>\n\
            <LastInvalidAt>1650555206110</LastInvalidAt>\n\
            <LockedoutAt>1650555206110</LockedoutAt>\n\
            <ActualLockoutDuration>300000</ActualLockoutDuration>\n\
            <NoOfTimesLocked>1</NoOfTimesLocked>\n\
            </InvalidPassword>',
            '<?xml version=\'1.0\' encoding=\'UTF-8\'?> \n\
            <Error><Code>MalformedSecurityHeader</Code> \n\
            <Message>Your request has a malformed header.</Message> \n\
            <ParameterName>x-amz-meta-original-file-name</ParameterName> \n\
            <Details>Header must be signed</Details> \n\
            </Error>',
            '<?xml version="1.0" encoding="UTF-8"?> \n\
            <!DOCTYPE bookstore [ \n\
            <!ELEMENT bookstore (book+)> \n\
            <!ELEMENT book (title, author+, category*, language?, year?, edition?, price)> \n\
            <!ATTLIST book ISBN CDATA #REQUIRED> \n\
            <!ELEMENT title    (#PCDATA)> \n\
            <!ELEMENT author   (#PCDATA)> \n\
            <!ELEMENT category (#PCDATA)> \n\
            <!ELEMENT language (#PCDATA)> \n\
            <!ELEMENT year     (#PCDATA)> \n\
            <!ELEMENT edition  (#PCDATA)> \n\
            <!ELEMENT price    (#PCDATA)> \n\
            ]> \n\
            <bookstore> \n\
            <book ISBN="0123456001"> \n\
            <title>Java For Dummies</title> \n\
            <author>Tan Ah Teck</author> \n\
            <category>Programming</category> \n\
            <year>2009</year> \n\
            <edition>7</edition> \n\
            <price>19.99</price> \n\
            </book> \n\
            <book ISBN="0123456002"> \n\
            <title>More Java For Dummies</title> \n\
            <author>Tan Ah Teck</author> \n\
            <category>Programming</category> \n\
            <year>2008</year> \n\
            <price>25.99</price> \n\
            </book> \n\
            <book ISBN="0123456010"> \n\
            <title>The Complete Guide to Fishing</title> \n\
            <author>Bill Jones</author> \n\
            <author>James Cook</author> \n\
            <author>Mary Turing</author> \n\
            <category>Fishing</category> \n\
            <category>Leisure</category> \n\
            <language>French</language> \n\
            <year>2000</year> \n\
            <edition>2</edition> \n\
            <price>49.99</price> \n\
            </book> \n\
            </bookstore>',
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:open="http://opensso.idsvcs.identity.sun.com/"> \n\
                <soapenv:Header/> \n\
                <soapenv:Body> \n\
                <open:read> \n\
                    <name>sm1tr5</name> \n\
                    <attributes> \n\
                        <name>realm</name> \n\
                        <values>/portal</values> \n\
                    </attributes> \n\
                    <attributes> \n\
                        <name>objecttype</name> \n\
                        <values>User</values> \n\
                    </attributes> \n\
                    <admin> \n\
                        <id>TOKEN</id> \n\
                    </admin> \n\
                </open:read> \n\
                </soapenv:Body> \n\
            </soapenv:Envelope>',
            '<tag1>tag1 content</tag1> \
            <tag1 again>another tag1 content</tag1> \
            <tag2>tag2 content</tag2> \
            <emptyTag /> \
            <emptyTag></emptyTag> \
            <tag3> \
                <nestedTag>nestedTag content</nestedTag> \
                <nestedEmptyTag1 /> \
                <nestedEmptyTag2></nestedEmptyTag2> \
            </tag3>'
        ];

        xmlStrings.forEach((xmlString) => {
            const xmlObject = parseXmlToJs(xmlString);
            logger.error('xmlObject: ' + JSON.stringify(xmlObject));
        });

        outcome = 'true';
    } catch (e) {
        logger.error('e: ' + e);
        outcome = 'false';
    }
}());
