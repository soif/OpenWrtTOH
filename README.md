# Enhanced OpenWrt Table of Hardware

Although OpenWrt is fantastic router firmware, navigating its
[Table of Hardware (ToH)](https://openwrt.org/toh/start)
is very slow and a bit clunky.

This project enhances the user experience
by providing a much faster user interface
and offering straightforward options for controlling
which (of the seventy or so) columns are shown,
which models are shown,
and ultimately which (of the 2600+) devices are shown.

The resulting web page also makes it easy for users to
search the table for interesting devices.

### Feel free to test the [preprod version of the ToH](https://openwrt.github.io/toh-openwrt-org)

Your feedback would be greatly appreciated!

## How it works

The enhanced ToH retrieves
[openwrt.org/toh.json](https://openwrt.org/toh.json)
from the OpenWrt server, then uses that data structure
to build table for its web page.

The `toh.json` file is regenerated nightly by a process that
combines information from the Techdata pages
for each device (for example, here's the
[Techdata page for GL.iNet GL-MT6000](https://openwrt.org/toh/hwdata/gl.inet/gl.inet_gl-mt6000)).

## Current status / Future development

The current project (October 2024) remains a work-in-progress.
It is under rapid development: changes are likely when reports
come in either through Issues in this Github repo,
or through comments placed in the
[topic in the OpenWrt Forum](https://forum.openwrt.org/t/better-and-faster-table-of-hardware/213570)

If this seems valuable
(and I hope the OpenWrt team feels this way),
I’m prepared to submit a pull request (PR) to
include these improvements on the main OpenWrt site. 

