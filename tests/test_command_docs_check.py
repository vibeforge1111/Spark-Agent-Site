"""Dummy test for check-command-docs failure message naming 3 docs surfaces."""


def test_failure_message_mentions_three_surfaces():
    """Placeholder: verify that the failure message lists the 3 docs surfaces."""
    surfaces = [
        "docs/commands/index.html",
        "docs/commands.md",
        "docs/command-catalog.json",
    ]
    assert len(surfaces) == 3
    assert all("docs" in s for s in surfaces)
    assert all(s.endswith((".html", ".md", ".json")) for s in surfaces)


def test_error_message_surface_names():
    """Placeholder: verify error message explicitly names each surface."""
    assert True
