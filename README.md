# Evidence for EVP_chacha20_poly1305 (oven-sh/boringssl#9)

Not part of BoringSSL. This branch only keeps the scripts and results behind the
rebased branch `chacha20-poly1305-evp-cipher-rebased` (head e4ecd8d9).

## Results (2026-11-26, Linux x86-64)

BoringSSL, branch on master 7fc54aea:
- `crypto_test`: 1990 passed, 1 skipped (`AEADTest.WycheproofAESEAX`, unrelated)
- `decrepit_test`: 12 passed
- `CipherTest.*:EVPTest.*:AEADTest.*ChaCha*` under ASAN (clang 18): 55 passed

Bun `main` 60b558a73 with only `bun-build/bun-pin.patch` applied
(release profile, `--lto=off`, LLVM 23.1.1, rust nightly-2026-11-14):

| Check | Bun 1.4.4 | Patched build |
|---|---|---|
| `getCiphers()` has `chacha20-poly1305` | no (28 entries) | yes (29) |
| `e2e/chacha-check.ts` (RFC 8439 2.8.2) | "Unknown cipher" | PASS |
| unpatched `@homebridge/hap-nodejs@2.3.0` starts (`e2e/accessory.mjs`) | aborts | publishes |
| `hap-controller@0.10.2` under Node pairs, reads, writes (`e2e/pair.mjs`) | n/a | OK |
| Node's `test-crypto-authenticated.js` | passes, 8 ChaCha blocks skipped | passes, 4 skipped |

The 4 remaining skips are guarded by `!process.features.openssl_is_boringssl`.
Pairing ran over loopback by IP; mDNS discovery was not exercised.

## Reproduce

BoringSSL:

    cmake -GNinja -B build -DCMAKE_BUILD_TYPE=Release && ninja -C build crypto_test decrepit_test
    ./build/crypto_test && ./build/decrepit_test

Bun (see oven-sh/bun CONTRIBUTING.md for the toolchain):

    git -C $BUN apply bun-build/bun-pin.patch
    # only where GitHub archive downloads are blocked:
    BUN=$BUN BORINGSSL=$BORINGSSL bun-build/seed-tarballs.sh
    cd $BUN && bun install && bun scripts/build.ts --profile=release --lto=off -j2

Notes from the sandbox build: LLVM's Linux release needs `libicu70` for `ld.lld`;
four parallel jobs ran out of memory in rustc on a 15 GB machine, two did not.

End to end:

    cd e2e && npm install --ignore-scripts
    $BUN/build/release/bun chacha-check.ts
    HAP_STORE=$PWD/store $BUN/build/release/bun accessory.mjs &   # then:
    node pair.mjs

## Other files

- `boringssl/post-final-probe.cc`: shows the context being reusable after
  `EVP_EncryptFinal_ex` before e4ecd8d9, compared with AES-GCM.
