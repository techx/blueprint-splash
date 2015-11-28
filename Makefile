SASS := sass
RM := rm

SASSFLAGS := --scss --unix-newlines --style compressed
RMFLAGS := -f

SCSS_DIR := assets/scss
CSS_OUT := assets/css

SCSS_SRC := $(shell find $(SCSS_DIR) -name "*.scss")
CSS_OBJS := $(patsubst $(SCSS_DIR)%, $(CSS_OUT)%, $(patsubst %.scss, %.css, $(SCSS_SRC)))

ALL_OBJS := $(CSS_OBJS)

$(CSS_OUT)/%.css: $(SCSS_DIR)/%.scss
	@echo + sass $@
	@$(SASS) $(SASSFLAGS) $< $@

all: $(ALL_OBJS)

# Still like auto-css generation
watch:
	@$(SASS) --watch $(SASSFLAGS) $(SCSS_DIR):$(CSS_OUT)

clean:
	@$(RM) $(RMFLAGS) $(ALL_OBJS)

.PHONY: all watch clean
