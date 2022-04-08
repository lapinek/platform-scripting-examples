/**
 @file Use at https://www.mycompiler.io/new/java
 @example https://www.mycompiler.io/view/9yCkxS8q4AY
 */

import java.util.*;
import java.lang.*;
import java.io.*;
// import org.apache.commons.lang3.ArrayUtils;
import  javax.crypto.Cipher;
import  javax.crypto.Mac;
import  javax.crypto.spec.SecretKeySpec;
import  java.security.MessageDigest;
import  java.lang.String;
import  java.lang.Byte;
import  java.security.SecureRandom;
import  javax.crypto.spec.IvParameterSpec;
import  java.util.Arrays;
import  java.io.ByteArrayOutputStream;
// import  org.forgerock.util.encode.Base64;
import java.util.Base64;
import  java.lang.System;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;

class Main {
    public static void main(String[] args) {
        // Get the encryption and signature keys
        // MessageDigest digest = MessageDigest.getInstance("SHA-256");

        byte[] test = (new ByteArrayOutputStream(16)).toByteArray(); // Does NOT create a byte array of requested size.
        System.out.println(test);
        System.out.println(test.length);
        System.out.println((new String("I'm 16 char long")).getBytes().length); // Works with a random string.

        MessageDigest digest = null;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        }catch(Exception e) {
            System.out.println("Something is wrong");
        }


        String multipassSecret = "hard-to-guess-multipass-secret";

        // multipassSecret is defined at this point, the value comes from our store admin
        byte[] hash = null;

        try {
            hash = digest.digest(multipassSecret.getBytes("UTF-8"));
        }catch(Exception e) {
            System.out.println("Something is wrong");
        }
        byte[] encryptionKey = Arrays.copyOfRange(hash, 0, 16);
        byte[] signatureKey= Arrays.copyOfRange(hash, 16, 32);

        // Get random IV
        SecureRandom random = new SecureRandom();
        byte iv[] = new byte[16];
        // byte iv[] = encryptionKey; - The line that didn't work.
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Encrypt user data
        SecretKeySpec skeySpec = new SecretKeySpec(encryptionKey, "AES");
        Cipher cipher = null;
        try {
            cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }
        try {
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec, ivSpec);
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }

        String json = "{ \"email\": \"ashulinsky@mediresource.com\", \"created_at\": \"2015-07-24T12:36:40-0400\" }";
        // byte[] encrypted = ArrayUtils.addAll(iv, cipher.doFinal(json.getBytes()));
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream( );
        try {
            outputStream.write( iv );
            outputStream.write( cipher.doFinal(json.getBytes()) );
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }

        byte encrypted[] = outputStream.toByteArray( );

        // Sign encrypted user data
        Mac sha256HMAC = null;
        try {
            sha256HMAC = Mac.getInstance("HmacSHA256");
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }

        SecretKeySpec secretKeySpec = new SecretKeySpec(signatureKey, "HmacSHA256");
        try {
            sha256HMAC.init(secretKeySpec);
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }
        byte[] signature = sha256HMAC.doFinal(encrypted);

        // Combine the encrypted data with its signature and base64-encode it
        outputStream.reset();
        try {
            outputStream.write(encrypted);
            outputStream.write(signature);
        } catch (Exception e) {
            System.out.println("Something is wrong");
        }
        String token = Base64.getUrlEncoder().encodeToString(outputStream.toByteArray());

        token = token.replace('+', '-')  // Replace + with -
                     .replace('/', '_'); // Replace / with _

        System.out.println(token);
    }
}