================================================================
  TINY QUESTERS -- FREE STARTER PACK
  A hero, two townsfolk, and two monsters -- enough to stand up
  a top-down RPG scene for free
  by Bobddadoo  (https://bobddadoo.itch.io)
================================================================

Thanks for downloading! This Starter Pack bundles the three free
Tiny Questers samples plus a bonus Slime from the Monster Starter
Pack into one download, so you can build a playable slice -- a
hero who fights, a village that feels alive, and two different
enemy types to test against -- without hunting down separate
files.

Everything here shares the same top-down pixel-art style, the
same 64-px grid, and the same feet-center pivot, so the Warrior,
the villagers, the Slime, and the Bat all stand on the same
ground line and drop into the same animator setup.

Free for personal AND commercial projects. See LICENSE.txt.


----------------------------------------------------------------
  WHAT'S IN THIS PACK      (5 characters * 72 clips * 553 frames)
----------------------------------------------------------------

  HERO
    warrior_free/       Warrior -- fully-animated 4-direction
                        hero: idle, walk, hit, death (with a
                        no-shadow variant), 4-direction attacks
                        in both a stepping and a stay-in-place
                        variant, and a victory (win) pose in
                        both facings.
                        19 clips, 220 frames.

  NPCs
    npc_pack_free/      Village Man + Female Villager -- idle
                        and walk in all 4 directions, plus
                        hand-drawn side-facing idles
                        (idle_left / idle_right) in smooth and
                        classic timing.
                        20 clips, 102 frames.

  MONSTERS
    slime_free/         Slime -- a bouncy blob enemy with
                        idle, walk, an alternate down_move hop,
                        4-direction attack, a down_stay wind-up
                        hold, hit reactions, and two death
                        styles.
                        17 clips, 111 frames.

    bat_free/           Bat -- an airborne enemy with idle,
                        4-way walk, 4-direction attack, a
                        separate projectile FX clip per
                        direction, hit, and death.
                        16 clips, 120 frames.

  Each pack keeps its own folder. This top-level README and
  LICENSE cover the whole Starter Pack -- the individual per-pack
  readme/license files have been removed so there is just one of
  each to read.


----------------------------------------------------------------
  SHARED SPEC
----------------------------------------------------------------

  - 64-px base canvas with a shared feet-center pivot. Some
    attack / death / win clips use a larger canvas (listed per
    pack below) but keep the SAME pivot, so swapping clips at
    runtime never shifts the character.
  - Up is a proper back view throughout -- the character seen
    from behind, walking away from the camera.
  - Every clip ships four ways:
      png/single/       individual PNG frames
      png/atlas/        one horizontal sprite sheet per clip
      png/single_pot/   power-of-two padded copies of single/
      png/atlas_pot/    power-of-two padded copies of atlas/
    POT copies place the original art at top-left (0,0) with
    transparent padding on the right/bottom, so per-frame pixel
    sizes and the pivot are identical to the non-POT versions --
    slice them with the SAME cell size.
  - gif/1x/ and gif/5x/ hold transparent-background preview GIFs
    of every clip (5x is nearest-neighbor upscaled) for quick
    reference and for store screenshots.
  - Timing: about 6.67 fps across the pack, which is what the
    preview GIFs play at. (The NPC side idles are the exception:
    smooth runs 8 frames at 75 ms, classic 4 frames at 150 ms,
    same total loop length.)
  - Engine-agnostic -- Unity, Godot, GameMaker, Construct, RPG
    Maker and more.


----------------------------------------------------------------
  WARRIOR -- warrior_free/        (19 clips, 220 frames)
----------------------------------------------------------------

  CANVAS SIZES
    idle / walk / hit ......... 64  x 49
    die / die_no_shadow ....... 73  x 49   (the sword extends to
                                            the side as he falls)
    win_right / win_left ...... 64  x 64   (raised sword needs the
                                            height -- same ground
                                            line as idle)
    attack_* .................. 128 x 128  (swing arc + trail)

  CLIPS
    idle/down ............ 5     idle/up .............. 5
    walk/down ............ 4     walk/up .............. 4
    walk/left ............ 4     walk/right ........... 4
    hit .................. 2
    die .................. 10    die_no_shadow ........ 10
    win_right ............ 10    win_left ............. 10 (mirrored)
    attack_down .......... 20    attack_down_stay ..... 20
    attack_up ............ 20    attack_up_stay ....... 20
    attack_left .......... 18    attack_left_stay ..... 18
    attack_right ......... 18    attack_right_stay .... 18 (mirrored)

  ATTACK -- two variants per direction:
    attack_<dir>/       The warrior physically steps forward
                        inside the frame as part of the swing.
                        Use this to let the artwork carry the
                        motion while the transform stays still.
    attack_<dir>_stay/  He stays planted on the spot -- drive the
                        forward step in code (root motion, dash,
                        lunge). The sprite will not fight you for
                        screen-space ownership.
    Pick ONE variant per direction; do not blend them.

  20-frame attacks run about 3.0s, 18-frame attacks about 2.7s.
  GIF previews exist only for the moving (non-_stay) variants, so
  the preview shows the full step-in motion.

  ATLAS SLICING (png/atlas/)
    idle_down / idle_up ....... 320  x 49  (5 frames, 64 px/frame)
    walk_* .................... 256  x 49  (4 frames, 64 px/frame)
    hit ....................... 128  x 49  (2 frames, 64 px/frame)
    die / die_no_shadow ....... 730  x 49  (10 frames, 73 px/frame)
    win_right / win_left ...... 640  x 64  (10 frames, 64 px/frame)
    attack_* .................. 2048 x 256 (128 px cells, 16 per
                                            row, remainder row 2)
  atlas_pot/ pads these to 512 x 64 / 256 x 64 / 128 x 64 /
  1024 x 64 respectively; the attack sheets are already POT and
  are byte-identical to atlas/.


----------------------------------------------------------------
  NPCs -- npc_pack_free/          (20 clips, 102 frames)
----------------------------------------------------------------

  Both villagers are 64 x 64 throughout, on the shared pivot.
  Left and right are hand-drawn per facing, not mirrored, so
  each direction reads naturally.

  FRAME COUNTS      idle_down / idle_up / idle_left / idle_right /
                    walk_down / walk_up / walk_left / walk_right
    Village Man ......... 5 / 4 / 8 / 8 / 4 / 4 / 6 / 6
    Female Villager ..... 5 / 4 / 8 / 8 / 4 / 4 / 4 / 4

  SIDE IDLES -- two timings each
    idle_left / idle_right .............. 8 frames @ 75 ms (smooth)
    idle_left_classic / idle_right_classic  4 frames @ 150 ms
                                            (chunkier retro cadence,
                                             same loop length)
    Pick one timing per NPC; both are provided for every facing.

  ATLAS SLICING -- 64 px per frame for every clip. Sheets run
  256 / 320 / 384 / 512 px wide depending on frame count; in
  atlas_pot/ they are padded up to the next power of two, still
  64 px per frame.

  Files are named <npc>_<clip>.png in atlas/ and grouped as
  single/<npc>/<clip>/ in single/.


----------------------------------------------------------------
  SLIME -- slime_free/            (17 clips, 111 frames)
----------------------------------------------------------------

  The Slime stays on a 64 x 64 canvas throughout, with the same
  shared feet-center pivot as the rest of the Starter Pack.

  CLIPS
    idle_down ..... 5      idle_up ........ 5
    walk_down ..... 6      walk_up ........ 5
    walk_left ..... 5      walk_right ..... 5
    walk_down_move  6      (alt. squashier hop variant)
    attack_down ... 8      attack_up ...... 7
    attack_left ... 9      attack_right ... 9 (mirrored)
    attack_down_stay 7     (wind-up / hold pose)
    hit_down ...... 4      hit_up ......... 3
    hit_right ..... 3
    die_a ......... 17     die_b .......... 7

  NOTES
    walk_down_move gives you a more exaggerated downward hop for
    squash-and-stretch movement. attack_down_stay is a hold pose
    that works well as a telegraph or wind-up before release.
    die_a is the long splat death; die_b is the quick pop.

  ATLAS SLICING
    Every Slime atlas uses 64 x 64 cells. Width varies by frame
    count (192 / 256 / 320 / 384 / 448 / 576 / 1088 px), and
    atlas_pot/ pads each sheet up to the next power of two while
    keeping the art at top-left (0,0).


----------------------------------------------------------------
  BAT -- bat_free/                (16 clips, 120 frames)
----------------------------------------------------------------

  CANVAS SIZES
    idle / walk / hit / die / effect ... 64  x 64
    attack_down ....................... 64  x 137
    attack_up ......................... 64  x 145
    attack_left / attack_right ........ 128 x 128

  CLIPS
    idle_down ..... 6      idle_up ....... 6   (back view)
    walk_down ..... 6      walk_up ....... 6
    walk_left ..... 6      walk_right .... 6   (mirrored from left)
    attack_down ... 12     attack_up ..... 12
    attack_left ... 12     attack_right .. 12  (mirrored from left)
    effect_down ... 6      effect_up ..... 6
    effect_left ... 5      effect_right .. 5
    hit_down ...... 6      die_down ...... 8

  The bat is airborne with a continuous wing-flap, so its down /
  up walk deliberately reuses the same flap loop as its idle -- a
  hovering enemy can simply play it non-stop.

  ATTACK is a lunge whose reach extends well past the body, which
  is why those clips use the taller / wider canvases above. Same
  feet-center pivot. Slice each attack atlas at ITS OWN cell size
  (down 64 x 137, up 64 x 145, left/right 128 x 128) -- not 64x64.

  EFFECT is the bat's projectile (a spit / sonic bolt) on a plain
  64 x 64 canvas -- play effect_<dir> alongside attack_<dir> to
  land a ranged hit.


----------------------------------------------------------------
  HOW TO USE
----------------------------------------------------------------

  Unity:
    1. Drop png/single/ or png/atlas/ into Assets/.
    2. Texture Type = Sprite (2D and UI).
    3. Filter Mode = Point (no filter), Compression = None -- this
       is what keeps pixel art crisp.
    4a. Single frames: select all PNGs of one clip and drag them
        into the scene to auto-create an Animation clip.
    4b. Atlas: Sprite Mode = Multiple, open Sprite Editor,
        Slice -> Grid By Cell Size, using the per-pack cell sizes
        listed above. For atlas_pot/ use the SAME cell size -- the
        extra empty cells at the right edge are transparent and can
        be left unused or deleted.

  Godot:
    1. Import png/single/ (or atlas/) into your project.
    2. In the Import dock set Filter = Off and Mipmaps = Off.
    3. Use AnimatedSprite2D / AnimationPlayer -- single frames as
       separate textures, or atlas via AtlasTexture / Region.

  General:
    - Loop: idle_*, walk_*. One-shot: hit, die, attack_*, win.
    - 4-direction movement: drive walk_down / up / left / right
      from the move vector, fall back to the matching idle when
      the character stops.
    - Slime extras: walk_down_move is a good alternate locomotion
      clip when you want a chunkier hop, and attack_down_stay is a
      useful hold frame for telegraphs or charge-ups.
    - Mixing packs: the Warrior's idle / walk sit on a 64 x 49
      canvas and the NPCs / Slime on 64 x 64, but the pivot is the
      same feet-center point in all of them. The Bat mostly sits on
      64 x 64 too, with larger attack cells that keep that same
      ground contact point.


----------------------------------------------------------------
  LICENSE -- SHORT VERSION  (full text in LICENSE.txt)
----------------------------------------------------------------

  [OK] Free for personal and commercial projects
  [OK] Credit appreciated but not required
  [OK] Modify and edit freely to fit your game
  [NO] Do not resell or redistribute the assets on their own,
       or as part of another asset pack
  [NO] Do not use these assets to train AI / machine-learning
       models

  In short: use it in your games as much as you like -- just
  do not repackage and sell the art itself.

  Credit, if you would like to give it:
      "Pixel art by Bobddadoo -- https://bobddadoo.itch.io"


----------------------------------------------------------------
  WHERE TO GO FROM HERE
----------------------------------------------------------------

  The pieces in this Starter Pack all lead into fuller releases on
  the same itch.io page:

    Tiny Questers -- 8 NPC Pack
        The two villagers plus a Blacksmith, Guard, Old Man,
        Town Girl, Merchant and Barmaid (+ bonus shop signs
        and icons). 86 clips.

    Tiny Questers -- Monster Starter Pack
        The Slime and Bat included here come from this pack,
        which also adds Goblin and Skeleton for a full four-
        monster lineup. 61 clips, 377 frames.

    Tiny Questers -- Monster Second Pack
        Orc, Lizard, Mushroom and Golem (mossy + clean),
        83 clips, 1136 frames, in smooth and classic timing,
        plus dust / teleport FX and a ginkgo tree.

    Tiny Questers -- Mage / Elf Archer
        Full hero classes with magic and bow attack sets,
        matching VFX and victory poses.

    Tiny Questers -- Character Bundle Vol.1
        Heroes, NPCs and monsters in one discounted download.

  Follow Bobddadoo on itch.io to be notified when new classes,
  NPCs and monsters drop -- followers get launch-week discounts.


----------------------------------------------------------------
  FEEDBACK
----------------------------------------------------------------

  Which character or monster should join the world next? Spotted
  a misaligned frame? Leave a comment on the itch.io page --
  feedback directly shapes "Tiny Questers".

  Thanks for checking it out -- happy dev!  :)


================================================================
  (c) Bobddadoo -- https://bobddadoo.itch.io
================================================================
