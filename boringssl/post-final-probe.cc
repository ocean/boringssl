#include <openssl/cipher.h>
#include <openssl/err.h>
#include <stdio.h>
#include <string.h>
static void run(const EVP_CIPHER *c, const char *name) {
  uint8_t key[32] = {1}, iv[12] = {2}, in[32] = {0}, out[64], tag[16];
  int len;
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  EVP_EncryptInit_ex(ctx, c, nullptr, key, iv);
  EVP_EncryptUpdate(ctx, out, &len, in, 32);
  int f = EVP_EncryptFinal_ex(ctx, out, &len);
  int u2 = EVP_EncryptUpdate(ctx, out, &len, in, 32);
  int f2 = EVP_EncryptFinal_ex(ctx, out, &len);
  int g = EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_AEAD_GET_TAG, 16, tag);
  printf("%s: final=%d update-after-final=%d final2=%d gettag=%d mode=%u\n", name, f, u2, f2, g, EVP_CIPHER_mode(c));
  // decrypt: tag then garbage, final twice
  EVP_DecryptInit_ex(ctx, c, nullptr, key, iv);
  memset(tag, 0, 16);
  EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_AEAD_SET_TAG, 16, tag);
  EVP_DecryptUpdate(ctx, out, &len, in, 32);
  int d1 = EVP_DecryptFinal_ex(ctx, out, &len);
  printf("  bad-tag final=%d err=%lu\n", d1, (unsigned long)ERR_peek_error());
  // short IV
  EVP_CIPHER_CTX_reset(ctx);
  EVP_EncryptInit_ex(ctx, c, nullptr, nullptr, nullptr);
  printf("  set_ivlen(8)=%d\n", EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_AEAD_SET_IVLEN, 8, nullptr));
  ERR_clear_error();
  EVP_CIPHER_CTX_free(ctx);
}
int main() { run(EVP_chacha20_poly1305(), "chacha20-poly1305"); run(EVP_aes_256_gcm(), "aes-256-gcm"); }
