/**
 * @file Provides a JavaScript example of Base64 encoding and decoding in Access Management (AM) scripts
 * by using a (minified) custom JavaScript object.
 * @version 0.1.0
 */

try {
    /**
     * https://www.webtoolkit.info/javascript-base64.html
     */
    // eslint-disable-next-line quotes, semi, no-useless-escape, no-undef
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(input){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;input=Base64._utf8_encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=(chr1&3)<<4|chr2>>4;enc3=(chr2&15)<<2|chr3>>6;enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}else if(isNaN(chr3)){enc4=64}output=output+this._keyStr.charAt(enc1)+this._keyStr.charAt(enc2)+this._keyStr.charAt(enc3)+this._keyStr.charAt(enc4)}return output},decode:function(input){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=this._keyStr.indexOf(input.charAt(i++));enc2=this._keyStr.indexOf(input.charAt(i++));enc3=this._keyStr.indexOf(input.charAt(i++));enc4=this._keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2)}if(enc4!=64){output=output+String.fromCharCode(chr3)}}output=Base64._utf8_decode(output);return output},_utf8_encode:function(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if(c>127&&c<2048){utftext+=String.fromCharCode(c>>6|192);utftext+=String.fromCharCode(c&63|128)}else{utftext+=String.fromCharCode(c>>12|224);utftext+=String.fromCharCode(c>>6&63|128);utftext+=String.fromCharCode(c&63|128)}}return utftext},_utf8_decode:function(utftext){var string="";var i=0;var c=c1=c2=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++}else if(c>191&&c<224){c2=utftext.charCodeAt(i+1);string+=String.fromCharCode((c&31)<<6|c2&63);i+=2}else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);string+=String.fromCharCode((c&15)<<12|(c2&63)<<6|c3&63);i+=3}}return string}};

    /**
     * Example JavaScript string.
     */
    var stringToEncode = '[{"key": "value"}]';

    /**
     * The Base64.encode and Base64.decode methods return a JavaScript string variable
     * concatenated with other strings by using the "+" operator.
     * In Rhino 1.7R4 and above,
     * assigning a string concatenated with other strings by using the "+" operator
     * to a variable in the top-level scope
     * results in an instance of the org.mozilla.javascript.ConsString class:
     * {@link https://mozilla.github.io/rhino/javadoc/org/mozilla/javascript/ConsString.html}.
     * @example
     * var s = '';
     * s = s + '';
     * logger.error(s.class); // For this, you'll need to add java.lang.Class to the allowed Java in AM scripting engine configuration.
     * > ERROR: class org.mozilla.javascript.ConsString
     *
     * Any access to an org.mozilla.javascript.ConsString instance, including the example above,
     * will require adding this class to the allowed Java in AM scripting engine configuration,
     * which is currently not done by default:
     * {@link https://bugster.forgerock.org/jira/browse/OPENAM-17090}.
     *
     * Use JavaScript stringify means, such as
     * the String object in non-constructor mode,
     * the .concat() method,
     * the .split('').join('') technique,
     * etc. (but NOT the "+" operator)
     * to convert the value to a JavaScript string
     * prior to assigning it to a variable in the top-level scope
     * in order to access its JavaScript string methods and properties.
     *
     * Alternatively, you can run your code inside a function (doing so provides other benefits as well).
     *
     * As another alternative, you can use the result of Base64.encode and Base64.decode directly, without assigning it to a variable in the top-level scope:
     * @example
     * logger.error(Base64.decode(Base64.encode(stringToEncode)));
     */
    var encodedString = String(Base64.encode(stringToEncode));

    var decodedString = String(Base64.decode(encodedString));

    /**
     * Display logs.
     */
    logger.error('String to encode:');
    logger.error(stringToEncode);
    logger.error('Encoded string: ');
    logger.error(encodedString);
    logger.error('Decoded string: ');
    logger.error(decodedString);
} catch (e) {
    logger.error('Exception: ' + e);
}
